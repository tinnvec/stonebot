import image_downloader from 'image-downloader'
import mkdirp from 'mkdirp'
import path from 'path'
import winston from 'winston'

export default class FileManager {
    static downloadFile(uri, filename) {
        return new Promise((resolve, reject) => {
            winston.debug(`Requesting file from ${uri}`)
            mkdirp(path.dirname(filename), error => {
                if (error) { return reject(error) }
                image_downloader({
                    url: uri,
                    dest: filename,
                    done: (error, result) => {
                        if (error) { return reject(error) }
                        winston.debug(`Downloaded file to ${result}`)
                        resolve(result)
                    }
                })
            })
        })
    }
}
