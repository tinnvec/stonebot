import ffmpeg from 'fluent-ffmpeg'
import uniqueFilename from 'unique-filename'
import os from 'os'

export default class SoundProcessor {
    static getCardSoundUrl(filename) {
        // alternate: http://media.services.zam.com/v1/media/byName/hs/sounds/enus
        const urlBase = 'http://media-hearth.cursecdn.com/audio/card-sounds/sound'
        const extension = 'ogg'
        return `${urlBase}/${filename}.${extension}`
    }

    static mergeSounds(sounds) {
        const filename = `${uniqueFilename(os.tmpdir())}.ogg`
        const cmd = ffmpeg()
        return new Promise((resolve, reject) => {
            cmd.on('error', err => { reject(err) })
            cmd.on('end', () => { resolve(filename) })

            sounds.forEach(sound => {
                cmd.input(this.getCardSoundUrl(sound.name))
                cmd.inputOption(`-itsoffset ${sound.delay}`)
            })
            cmd.complexFilter([{
                filter: 'amix',
                options: { inputs: sounds.length }
            }])
            cmd.audioCodec('libvorbis').save(filename)
        })
    }
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
