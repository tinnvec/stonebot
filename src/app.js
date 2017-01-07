import Discord from 'discord.js'
import Fuse from 'fuse.js'
import HearthstoneJSON from 'hearthstonejson'
import toMarkdown from 'to-markdown'
import ffmpeg from 'fluent-ffmpeg'

import cardSoundsNames from './sounds/card-sounds-names.json'

import config from './config/config'

const client = new Discord.Client()
const hsjson = new HearthstoneJSON()

if (config.logLevel > 1) { client.on('debug', console.info) }
if (config.logLevel > 0) { client.on('warn', console.warn) }
client.on('error', console.error)

client.on('ready', () => {
    client.user.setGame('Hearthstone')
})

client.on('message', message =>  {
    let matches = detectCardMentions(message)
    if (matches.length < 1) { return }
    message.channel.startTyping()
    hsjson.getLatest(cards => {
        try {
            matches.forEach(match => {
                let card = searchForCard(cards, match[1])
                if (!card) { return }
                if (match[2].startsWith('sound')) {
                    let authorVoiceChannel = getMessageAuthorVoiceChannel(message)
                    if (authorVoiceChannel) {
                        let pat = /sound-?([a-zA-Z]+)/g
                        let m = pat.exec(match[2])
                        let res = m ? m[1] || 'play' : 'play'
                        if (['attack', 'death', 'play', 'trigger'].includes(res)) {
                            playSound(authorVoiceChannel, card.id, res)
                        }
                    }
                }
                message.channel.sendMessage(formatOutput(card, match[2]))
            })
        } catch (ex) { console.log(ex) }
        message.channel.stopTyping()
    })
})

client.login(config.token)

function mergeCardSounds(sounds) {
    return new Promise((resolve, reject) => {
        let filename = `${__dirname}/sounds/${Math.round(Math.random() * 100)}.ogg`
        let cmd = ffmpeg()
        sounds.forEach(sound => {
            cmd.input(getSoundUrl(sound.name))
            cmd.inputOption(`-itsoffset ${sound.delay}`)
        })
        cmd.complexFilter([{
            filter: 'amix',
            options: { inputs: sounds.length }
        }])
        cmd.on('error', err => {
            console.log(err)
            reject(err)
        })
        cmd.on('end', () => { resolve(filename) })
        cmd.audioCodec('libvorbis').save(filename)
    })
}

// function concatCardSounds(soundFiles) {
//     return new Promise((resolve, reject) => {
//         let filename = `${__dirname}/sounds/${Math.round(Math.random() * 100)}.ogg`
//         let cmd = ffmpeg()
//         soundFiles.forEach(file => { cmd.input(file) })
//         cmd.on('error', err => {
//             console.log(err)
//             reject(err)
//         })
//         cmd.on('end', () => { resolve(filename) })
//         cmd.audioCodec('libvorbis').mergeToFile(filename, `${__dirname}/sounds/tmp`)
//     })
// }

function getSoundUrl(filename) {
    const urlBase = 'http://media-hearth.cursecdn.com/audio/card-sounds/sound'
    // alternate: http://media.services.zam.com/v1/media/byName/hs/sounds/enus
    const extension = 'ogg'
    return `${urlBase}/${filename}.${extension}`
}

function playSound(channel, cardId, soundType) {
    if (!cardSoundsNames[cardId]) { return }
    let cardSounds = cardSoundsNames[cardId]
    if (!cardSounds[soundType] || cardSounds[soundType].length < 1) { return }
    let sounds = []
    cardSounds[soundType].forEach(sound => { sounds.push(sound) })
    mergeCardSounds(sounds).then(file => {
        channel.join().then(connection => {
            connection.playFile(file).on('end', () => {
                channel.leave()
            })
        }).catch(console.error)
    }).catch(console.error)
}

function getMessageAuthorVoiceChannel(message) {
    let allChannels = message.channel.guild.channels
    let result = null
    allChannels.forEach(channel => {
        if (channel instanceof Discord.VoiceChannel
            && channel.members.get(message.author.id)) {
            result = channel
        }
    })
    return result
}

function detectCardMentions(message) {
    let pattern = /:{2}([^:\?]+)\??([^:]*):{2}/g
    let matches = []
    let match = pattern.exec(message.content)
    while (match) {
        matches.push(match)
        match = pattern.exec(message.content)
    }
    return matches
}

function searchForCard(allCards, pattern) {
    let uncollectibleOnly = false
    if (pattern.startsWith('@')) {
        pattern = pattern.substring(1)
        uncollectibleOnly = true
    }

    let uncollectibleFuse = new Fuse(
        allCards.filter(card => { return !card.collectible }),
        { keys: ['name'], include: ['score'] }
    )
    let foundUncollectible = uncollectibleFuse.search(pattern)

    if (uncollectibleOnly) {
        return foundUncollectible[0].item
    }

    let collectibleFuse = new Fuse(
        allCards.filter(card => { return card.collectible }),
        { keys: ['name'], include: ['score'] }
    )
    let foundCollectible = collectibleFuse.search(pattern)

    if (foundUncollectible[0].score < foundCollectible[0].score) {
        return foundUncollectible[0].item
    }
    return foundCollectible[0].item
}

function formatOutput(card, addon) {
    if (addon === 'image') {
        return `http://media.services.zam.com/v1/media/byName/hs/cards/enus/${card.id}.png`
    }

    if (addon === 'gold') {
        return `http://media.services.zam.com/v1/media/byName/hs/cards/enus/animated/${card.id}_premium.gif`
    }

    if (addon === 'art') {
        return `https://art.hearthstonejson.com/v1/512x/${card.id}.jpg`
    }

    let result = `${card.name} -`

    if (card.cost) {
        result += ` ${card.cost} Mana`
    }

    if (card.attack) {
        result += ` ${card.attack}/${card.health || card.durability}`
    }

    result += ` ${card.playerClass.toLowerCase().capitalizeFirstLetter()}`
    result += ` ${card.type.toLowerCase().capitalizeFirstLetter()}`

    if (card.collectionText) {
        result += `\n${toMarkdown(card.collectionText)}`
    } else if (card.text) {
        result += `\n${toMarkdown(card.text)}`
    }

    if (addon === 'flavor' && card.flavor) {
        result += `\n${card.flavor}`
    }

    return result
}

String.prototype.capitalizeFirstLetter = function() {
    return this.charAt(0).toUpperCase() + this.slice(1)
}
