import ffmpeg = require('fluent-ffmpeg')
import * as mkdirp from 'mkdirp'
import * as path from 'path'

export default class SoundProcessor {
    public static mergeSounds(sounds: Array<{ name: string, delay: number}>, filename: string): Promise<string> {
        const cmd = ffmpeg()
        return new Promise((resolve, reject) => {
            mkdirp(path.dirname(filename), (error) => {
                if (error) { return reject(error) }
                cmd.on('error', (err: string) => { reject(err) })
                cmd.on('end', () => { resolve(filename) })

                sounds.forEach((sound) => {
                    cmd.input(sound.name)
                    cmd.inputOption(`-itsoffset ${sound.delay}`)
                })
                cmd.complexFilter(`amix=inputs=${sounds.length}`, null)
                cmd.audioCodec('libvorbis').save(filename)
            })
        })
    }
}
