import * as fs from 'fs'
import * as mkdirp from 'mkdirp'
import * as path from 'path'
import * as request from 'request'
import * as winston from 'winston'

export default class FileManager {
    public static downloadFile(uri: string, filename: string): Promise<string> {
        return new Promise((resolve, reject) => {
            winston.debug(`Requesting file from ${uri}`)
            mkdirp(path.dirname(filename), (error) => {
                if (error) { return reject(error) }

                let requestClosedClean = false
                let requestError = ''

                const writeStream = fs.createWriteStream(filename)
                writeStream.on('error', (err: string) => { fs.unlink(filename, reject.bind(null, err)) })
                writeStream.on('finish', () => {
                    if (requestClosedClean) { return resolve(filename) }
                    fs.unlink(filename, reject.bind(null, requestError))
                })

                request.get(uri)
                    .on('error', (err) => { requestError = err.message })
                    .on('response', (response) => {
                        if (response.statusCode === 200) {
                            requestClosedClean = true
                        } else {
                            requestError = `${response.statusCode} - ${response.statusMessage}`
                        }
                    })
                    .pipe(writeStream)
                    .on('close', () => { requestClosedClean = true })
            })
        })
    }
}
