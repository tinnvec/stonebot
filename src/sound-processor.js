import ffmpeg from 'fluent-ffmpeg'
import mkdirp from 'mkdirp'
import path from 'path'
// import winston from 'winston'

export default class SoundProcessor {
    static mergeSounds(sounds, filename) {
        const cmd = ffmpeg()
        return new Promise((resolve, reject) => {
            mkdirp(path.dirname(filename), error => {
                if (error) { return reject(error) }
                cmd.on('error', err => { reject(err) })
                cmd.on('end', () => { resolve(filename) })

                sounds.forEach(sound => {
                    cmd.input(sound.name)
                    cmd.inputOption(`-itsoffset ${sound.delay}`)
                })
                cmd.complexFilter([{
                    filter: 'amix',
                    options: { inputs: sounds.length }
                }])
                cmd.audioCodec('libvorbis').save(filename)
            })
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
