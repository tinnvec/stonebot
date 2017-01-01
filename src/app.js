import Discord from 'discord.js'
import Fuse from 'fuse.js'
import HearthstoneJSON from 'hearthstonejson'
import toMarkdown from 'to-markdown'
import ffmpeg from 'fluent-ffmpeg'

import cardSounds from './sounds/card-sounds'

import config from './config/config'

const client = new Discord.Client()
const hsjson = new HearthstoneJSON()

client.on('ready', () => {
    client.user.setGame('Hearthstone')
})

client.on('message', message =>  {
    let matches = detectCardMentions(message)
    if (matches.length > 0) {
        message.channel.startTyping()
        hsjson.getLatest(cards => {
            try {
                matches.forEach(match => {
                    let card = searchForCard(cards, match[1])
                    if (card) {
                        if (match[2].startsWith('sound')) {
                            let authorVoiceChannel = getMessageAuthorVoiceChannel(message)
                            if (authorVoiceChannel) {
                                playSound(authorVoiceChannel, card.id)
                            }
                        }
                        message.channel.sendMessage(formatOutput(card, match[2]))
                    }
                })
            } catch (ex) { console.log(ex) }
            message.channel.stopTyping()
        })
    }
})

client.login(config.token)

function mergeCardSounds(soundFiles) {
    return new Promise((resolve, reject) => {
        let filename = `${__dirname}/sounds/${Math.round(Math.random() * 100)}.ogg`
        let cmd = ffmpeg()
        soundFiles.forEach(file => { cmd.input(file) })
        cmd.complexFilter([{
            filter: 'amix',
            options: {
                inputs: soundFiles.length
            }
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

function playSound(channel, cardId) {
    if (cardSounds[cardId]) {
        mergeCardSounds(cardSounds[cardId].play).then(file => {
            channel.join().then(connection => {
                connection.playFile(file).on('end', () => {
                    channel.leave()
                })
            }).catch(console.error)
        }).catch(console.error)
    }
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
