import * as fs from 'fs'
import * as Fuse from 'fuse.js'
import HearthstoneJSON from 'hearthstonejson'
import toMarkdown from 'to-markdown'
import winston from 'winston'

import FileManager from './file-manager'
import SoundProcessor from './sound-processor'

const cardSoundsById = require('./card-sounds-by-id')

export type HearthstoneJSONCard = {
    id: string,
    cost: Number,
    collectible: boolean,
    attack: Number,
    health: Number,
    durability: Number,
    name: string,
    type: string,
    playerClass: string,
    artist: string,
    text: string,
    collectionText: string,
    flavor: string,
    set: string
}

export type CardFuseResult = {
    item: HearthstoneJSONCard,
    score: Number
}

export default class Card {
    public static async findByName(name: string): Promise<Card> {
        const res = await this.search(name, ['name']).catch(winston.error)
        if (!res) { return null }
        return new Card(res)
    }

    public static getAll(): Promise<HearthstoneJSONCard[]> {
        const hsjson = new HearthstoneJSON()
        return new Promise((resolve, reject) => {
            try {
                hsjson.getLatest((cards: HearthstoneJSONCard[]) => { resolve(cards) })
            } catch (ex) {
                reject(ex)
            }
        })
    }

    public static async search(pattern: string, keys: string[]) {
        let uncollectibleOnly: boolean = false
        if (pattern.startsWith('@')) {
            winston.debug('Using uncollectible-only search mode.')
            pattern = pattern.substring(1)
            uncollectibleOnly = true
        }
        if (!Array.isArray(keys) || keys.length < 1) { keys = ['name'] }
        const allCards: HearthstoneJSONCard[] = await this.getAll()
        const uncollectibleFuse: Fuse = new Fuse(
            allCards.filter((card) => { return !card.collectible }),
            { keys, include: ['score'] }
        )
        const foundUncollectible: CardFuseResult[] = uncollectibleFuse.search<CardFuseResult>(pattern)
        if (uncollectibleOnly) { return foundUncollectible[0].item }
        const collectibleFuse = new Fuse(
            allCards.filter((card) => { return card.collectible }),
            { keys, include: ['score'] }
        )
        const foundCollectible: CardFuseResult[] = collectibleFuse.search<CardFuseResult>(pattern)
        if (foundCollectible.length < 1 && foundUncollectible.length < 1) { return null }
        if (foundCollectible.length < 1) { return foundUncollectible[0].item }
        if (foundUncollectible.length < 1) { return foundCollectible[0].item }
        if (foundUncollectible[0].score < foundCollectible[0].score) { return foundUncollectible[0].item }
        return foundCollectible[0].item
    }

    public json: {}
    public id: string
    public cost: Number
    public attack: Number
    public health: Number
    public durability: Number
    public name: string
    public type: string
    public playerClass: string

    private _artist: string
    private _text: string
    private _collectionText: string
    private _flavor: string

    constructor(obj: HearthstoneJSONCard) {
        this.json = obj
        // Identifiers
        this.id = obj.id
        // Stats
        this.cost = obj.cost
        this.attack = obj.attack
        this.health = obj.health
        this.durability = obj.durability
        // Details
        this.name = obj.name
        this.type = obj.type
        this.playerClass = obj.playerClass
        this._artist = obj.artist
        // Texts
        this._text = obj.text
        this._collectionText = obj.collectionText
        this._flavor = obj.flavor
    }

    public get artist(): string {
        return this._artist || '_[unknown]_'
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
        let desc = ''
        if (this.cost != null) { desc += ` ${this.cost} Mana` }
        if (this.attack) { desc += ` ${this.attack}/${this.health || this.durability}` }
        desc += ` ${this.playerClass.toLowerCase()}`
        desc += ` ${this.type.toLowerCase()}`
        return desc
    }

    public get flavor(): string {
        if (this._flavor) { return toMarkdown(this._flavor) }
        return '_[blank]_'
    }

    public get text(): string {
        if (this._collectionText) { return toMarkdown(this._collectionText) }
        if (this._text) { return toMarkdown(this._text) }
        return '_[blank]_'
    }

    public get url(): string {
        return `http://hearthstone.gamepedia.com/${this.name.replace(/\s/g, '_')}`
    }

    public async getImage(imageType?: string): Promise<string> {
        const filename = this.getImageFilename(imageType)
        if (fs.existsSync(filename)) {
            winston.debug('Image exits, using it.')
            return filename
        }
        winston.debug('Image does not exist, downloading it.')
        const res = await FileManager.downloadFile(this.getImageUrl(imageType), filename)
        if (!res || !res.startsWith('/data')) {
            winston.error(`Error downloading image: ${res}`)
            return null
        }
        return res
    }

    public getImageFilename(imageType: string): string {
        const dataPath = '/data/images'
        let imageTypePath = ''
        let imageExtension = 'png'
        if (imageType === 'gold') {
            imageTypePath = '/gold'
            imageExtension = 'gif'
        } else if (imageType === 'art') {
            imageTypePath = '/art'
            imageExtension = 'jpg'
        }
        return `${dataPath}${imageTypePath}/${this.id}.${imageExtension}`
    }

    public getImageUrl(imgType: string): string {
        if (!this.id) { return null }
        const cardImgBaseUrl = 'http://media.services.zam.com/v1/media/byName/hs/cards/enus'
        const artImgBaseUrl = 'http://art.hearthstonejson.com/v1/512x'
        let imgUrl = `${cardImgBaseUrl}/${this.id}.png`
        if (imgType === 'gold') {
            imgUrl = `${cardImgBaseUrl}/animated/${this.id}_premium.gif`
        } else if (imgType === 'art') {
            imgUrl = `${artImgBaseUrl}/${this.id}.jpg`
        }
        return imgUrl
    }

    public async getSound(soundKind: string): Promise<string> {
        const filename = this.getSoundFilename(soundKind)
        if (fs.existsSync(filename)) {
            winston.debug('Sound exits, using it.')
            return filename
        }
        const soundParts = this.getSoundParts(soundKind)
        if (!soundParts) { return null }
        winston.debug('Sound does not exist, creating it.')
        return await SoundProcessor.mergeSounds(soundParts, filename)
    }

    public getSoundFilename(soundKind: string): string {
        const dataPath = '/data/sounds'
        const extension = 'ogg'
        return `${dataPath}/${this.id}_${soundKind}.${extension}`
    }

    public getSoundParts(soundKind: string): Array<{name: string, delay: number}> {
        if (!cardSoundsById[this.id]) { return null }
        if (!soundKind) { soundKind = 'play' }
        if (!cardSoundsById[this.id][soundKind] || cardSoundsById[this.id][soundKind].length < 1) { return null }
        return cardSoundsById[this.id][soundKind].map((s: {name: string, delay: number}) => {
            return { name: this.getSoundUrl(s.name), delay: s.delay}
        })
    }

    public getSoundUrl(filename: string): string {
        // alternate: http://media.services.zam.com/v1/media/byName/hs/sounds/enus
        const urlBase = 'http://media-hearth.cursecdn.com/audio/card-sounds/sound'
        const extension = 'ogg'
        return encodeURI(`${urlBase}/${filename}.${extension}`)
    }
}
