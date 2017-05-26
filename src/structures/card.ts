import { oneLine } from 'common-tags'
import ffmpeg = require('fluent-ffmpeg')
import * as fs from 'fs'
import { IncomingMessage } from 'http'
import * as request from 'request'
import * as winston from 'winston'

const cardSoundsById = require('../database/card-sounds-by-id.json')

export default class Card {
    public cardClass: string
    public dbfId: number
    public id: string
    public name: string
    public playerClass: string
    public set: string
    public type: string

    public artist: string
    public collectible: boolean
    public flavor: string
    public json: HearthstoneJSONCard
    public text: string

    public attack?: number
    public collectionText?: string
    public cost?: number
    public durability?: number
    public elite?: boolean
    public entourage?: string[]
    public faction?: string
    public health?: number
    public hideStats?: boolean
    public howToEarn?: string
    public howToEarnGolden?: string
    public mechanics?: string[]
    public playRequirements?: object
    public race?: string
    public rarity?: string
    public referencedTags?: string[]

    constructor(obj: HearthstoneJSONCard) {
        this.cardClass = obj.cardClass
        this.dbfId = obj.dbfId
        this.id = obj.id
        this.name = obj.name
        this.playerClass = obj.playerClass
        this.set = obj.set
        this.type = obj.type

        this.artist = obj.artist || '_unknown_'
        this.collectible = obj.collectible || false
        this.flavor = obj.flavor ? this.cardTextToMarkdown(obj.flavor) : '_blank_'
        this.json = obj
        this.text = obj.text ? this.cardTextToMarkdown(obj.text) : '_blank_'

        this.attack = obj.attack
        this.collectionText = obj.collectionText ? this.cardTextToMarkdown(obj.collectionText) : undefined
        this.cost = obj.cost
        this.durability = obj.durability
        this.elite = obj.elite
        this.entourage = obj.entourage
        this.faction = obj.faction
        this.health = obj.health
        this.hideStats = obj.hideStats
        this.howToEarn = obj.howToEarn
        this.howToEarnGolden = obj.howToEarnGolden
        this.mechanics = obj.mechanics
        this.playRequirements = obj.playRequirements
        this.race = obj.race
        this.rarity = obj.rarity
        this.referencedTags = obj.referencedTags
    }

    public get classColor(): string {
        return new Map([
            ['WARRIOR', '#C41E3B'],
            ['SHAMAN',  '#007ADE'],
            ['ROGUE',   '#000000'],
            ['PALADIN', '#FFF569'],
            ['HUNTER',  '#ABD473'],
            ['DRUID',   '#C79C6E'],
            ['WARLOCK', '#9482C9'],
            ['MAGE',    '#69CCF0'],
            ['PRIEST',  '#FFFFFF'],
            ['NEUTRAL', '#808080']
        ]).get(this.playerClass)
    }

    public get description(): string {
        return oneLine`
            ${this.cost !== undefined ? `${this.cost} Mana` : ''}
            ${this.attack ? `${this.attack}/${this.health || this.durability}` : ''}
            ${this.rarity ? this.rarity === 'FREE' ? 'Basic' :
                this.capitalizeFirstLetter(this.rarity.toLowerCase()) : ''}
            ${this.capitalizeFirstLetter(this.playerClass.toLowerCase())}
            ${this.capitalizeFirstLetter(this.type.toLowerCase())}
        `
    }

    public get displayText(): string {
        return this.collectionText || this.text
    }

    public get wikiUrl(): string {
        return `http://hearthstone.gamepedia.com/${this.name.replace(/\s/g, '_')}`
    }

    public getImageFile(imgType: 'art' | 'gold' | 'image' = 'image'): Promise<string | undefined> {
        const baseArtUrl = 'http://art.hearthstonejson.com/v1/512x'
        const baseGoldUrl = 'http://media.services.zam.com/v1/media/byName/hs/cards/enus/animated'
        const baseImageUrl = `http://media.services.zam.com/v1/media/byName/hs/cards/enus`
        // alternate: `http://art.hearthstonejson.com/v1/render/latest/enUS/512x/${this.id}.png`

        return new Promise<string | undefined>((resolve, reject) => {
            const imgTypeExt = imgType === 'gold' ? 'gif' : imgType === 'art' ? 'jpg' : 'png'
            const filename = `/data/images/${imgType === 'image' ? '' : imgType}/${this.id}.${imgTypeExt}`
            if (fs.existsSync(filename)) {
                winston.debug(`${filename} found, using that.`)
                return resolve(filename)
            }

            const imgUrl = imgType === 'art' ?
                `${baseArtUrl}/${this.id}.jpg` :
                imgType === 'gold' ?
                    `${baseGoldUrl}/${this.id}_premium.gif` :
                    `${baseImageUrl}/${this.id}.png`

            winston.debug(`Creating file at ${filename}`)
            let requestClosedClean: boolean = false
            const writeStream: fs.WriteStream = fs.createWriteStream(filename)
                .on('error', (err: Error) => {
                    winston.error(`Error in file creation: ${err}`)
                    fs.unlink(filename, resolve.bind(undefined, undefined))
                })
                .on('finish', () => {
                    if (requestClosedClean) {
                        winston.debug('Created file successfully.')
                        resolve(filename)
                    } else {
                        fs.unlink(filename, resolve.bind(undefined, undefined))
                    }
                })

            winston.debug(`Downloading from ${imgUrl}`)
            request.get(imgUrl, { timeout: 5000 })
                .on('error', (err: Error) => {
                    winston.error(`Error downloading: ${err.message || 'unknown'}`)
                    fs.unlink(filename, resolve.bind(undefined, undefined))
                })
                .on('response', (response: IncomingMessage) => {
                    if (response.statusCode !== 200) {
                        winston.error(`Error downloading: ${response.statusCode} - ${response.statusMessage}`)
                    } else {
                        requestClosedClean = true
                    }
                })
                .pipe(writeStream)
                .on('close', () => requestClosedClean = true)
        })
    }

    public getSoundFile(sndType: string = 'play'): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            const filename = `/data/sounds/${this.id}_${sndType}.ogg`
            if (fs.existsSync(filename)) {
                winston.debug(`${filename} found, using that.`)
                return resolve(filename)
            }

            if (!cardSoundsById[this.id] ||
                !cardSoundsById[this.id][sndType] ||
                cardSoundsById[this.id][sndType].length < 1) {
                winston.error('No sounds for card')
                return resolve(undefined)
            }

            winston.debug('Generating urls for sound parts.')
            // alternate: `http://media.services.zam.com/v1/media/byName/hs/sounds/enus/${snd.name}.ogg`
            const sndUrls: Array<{url: string, delay: number}> = cardSoundsById[this.id][sndType]
                .map((snd: {name: string, delay: number}) =>
                    new Object({
                        delay: snd.delay,
                        url:
                        `http://media-hearth.cursecdn.com/audio/card-sounds/sound/${snd.name.replace(' ', '%20')}.ogg`
                    })
                )
            if (!sndUrls) {
                winston.error('No sounds for card')
                return resolve(undefined)
            }

            winston.debug(`Creating sound file at ${filename}`)
            const ffmpegCmd = ffmpeg()
            sndUrls.forEach((sound: {url: string, delay: number}) => {
                winston.debug(`Adding sound from ${sound.url} with delay of ${sound.delay}`)
                ffmpegCmd.input(sound.url).inputOption(`-itsoffset ${sound.delay}`)
            })
            ffmpegCmd.complexFilter(`amix=inputs=${sndUrls.length}`, undefined)
                .audioCodec('libvorbis')
                .on('error', (err: Error) => {
                    winston.error(`Error creating sound file: ${err}`)
                    return resolve(undefined)
                })
                .on('end', () => {
                    winston.debug('Successfully created sound file.')
                    return resolve(filename)
                })
                .save(filename)
        })
    }

    private cardTextToMarkdown(text: string): string {
        return text
            .replace(/\[x\]/gi, '')
            .replace(/<\/?b>/gi, '**')
            .replace(/<\/?i>/gi, '_')
            .replace(/\n/g, ' ')
            .replace(/\s\s/g, ' ')
            .trim()
    }

    private capitalizeFirstLetter(input: string): string {
        return `${input.charAt(0).toUpperCase()}${input.slice(1)}`
    }
}
