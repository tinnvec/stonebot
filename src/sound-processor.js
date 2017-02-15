const ffmpeg = require('fluent-ffmpeg')
const mkdirp = require('mkdirp')
const path = require('path')

class SoundProcessor {
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

module.exports = SoundProcessor
