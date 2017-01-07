import Discord from 'discord.js'
import ffmpeg from 'fluent-ffmpeg'

import messageHandler from './handlers/message-handler'
import config from './config/config'

const client = new Discord.Client()

if (config.logLevel > 1) { client.on('debug', console.info) }
if (config.logLevel > 0) { client.on('warn', console.warn) }
client.on('error', console.error)

client.on('guildCreate', guild => { console.log(`Joined Guild: ${guild.name}`) })
client.on('guildDelete', guild => { console.log(`Left Guild: ${guild.name}`) })

client.on('reconnecting', () => { console.log('Reconnecting...')})
client.on('disconnect', event => { console.log(`Disconnected: ${event.reason}`)} )

client.on('ready', () => {
    let guilds = client.guilds.map(guild => { return guild.name })
    console.log(`Current Guilds: ${guilds.join(', ')}`)
    client.user.setGame('Hearthstone')
})

client.on('message', messageHandler)

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
