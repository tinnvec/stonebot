import FileManager from '../file-manager'
import Fuse from 'fuse.js'
import HearthstoneJSON from 'hearthstonejson'
import SoundProcessor from '../sound-processor'

import fs from 'fs'
import toMarkdown from 'to-markdown'
import winston from 'winston'

import cardSoundsById from './card-sounds-by-id'

const CLASS_COLORS = { // RGB
    'WARRIOR': [196, 30, 59],
    'SHAMAN': [0, 122, 222],
    'ROGUE': [0, 0, 0],
    'PALADIN': [255, 245, 105],
    'HUNTER': [171, 212, 115],
    'DRUID': [199, 156, 110],
    'WARLOCK': [148, 130, 201],
    'MAGE': [105, 204, 240],
    'PRIEST': [255, 255, 255],
    'NEUTRAL': [128, 128, 128]
}

export default class Card {
    constructor(obj) {
        this.json = obj

        // Identifiers
        this.id = obj.id
        // this.dbfId = obj.dbfId

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
        // this.collectible = obj.collectible
        // this.rarity = obj.rarity
        // this.set = obj.set
        // this.multiClassGroup = obj.multiClassGroup
        // this.classes = obj.classes
        // this.faction = obj.faction
        
        // Texts
        this._text = obj.text
        this._collectionText = obj.collectionText
        this._flavor = obj.flavor
        // this.targetingArrowText = obj.targetingArrowText
        // this.howToEarn = obj.howToEarn
        // this.howToEarnGolden = obj.howToEarnGolden

        // Other
        // this.dust = obj.dust
        // this.playRequirements = obj.playRequirements
        // this.mechanics = obj.mechanics
        // this.entourage = obj.entourage
    }

    get artist() {
        if (this._artist) { return this._artist }
        return '_[unknown]_'
    }

    get text() {
        if (this._collectionText) { return toMarkdown(this._collectionText) }
        if (this._text) { return toMarkdown(this._text) }
        return '_[blank]_'
    }

    get flavor() {
        if (this._flavor) { return toMarkdown(this._flavor) }
        return '_[blank]_'
    }

    get classColor() {
        return CLASS_COLORS[this.playerClass]
    }

    get description() {
        let desc = ''
        if (this.cost != null) { desc += ` ${this.cost} Mana` }
        if (this.attack) { desc += ` ${this.attack}/${this.health || this.durability}` }
        desc += ` ${this.playerClass.toLowerCase().capitalizeFirstLetter()}`
        desc += ` ${this.type.toLowerCase().capitalizeFirstLetter()}`
        return desc
    }

    async getImage(imageType) {
        const filename = this.getImageFilename(imageType)
        if (fs.existsSync(filename)) {
            winston.debug('File exits, using it.')
            return filename
        }
        winston.debug('File does not exist, downloading it.')
        const res = await FileManager.downloadFile(this.getImageUrl(imageType), filename).catch(winston.error)
        if (!res || !res.startsWith('/data')) {
            winston.debug(`Error downloading file: ${res}`)
            return null
        }
        return res
    }

    getImageFilename(imageType) {
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

    getImageUrl(imgType) {
        if (!this.id) { return null }
        const cardImgBaseUrl = 'http://media.services.zam.com/v1/media/byName/hs/cards/enus'
        const artImgBaseUrl = 'http://art.hearthstonejson.com/v1/512x'
        let imgUrl = `${cardImgBaseUrl}/${this.id}.png`
        if (imgType === 'gold') { imgUrl = `${cardImgBaseUrl}/animated/${this.id}_premium.gif` }
        else if (imgType === 'art') { imgUrl = `${artImgBaseUrl}/${this.id}.jpg` }
        return imgUrl
    }

    async getSound(soundKind) {
        let filename = this.getSoundFilename(soundKind)
        if (fs.existsSync(filename)) {
            winston.debug('File exits, using it.')
            return filename
        }
        const soundParts = this.getSoundParts(soundKind)
        if (!soundParts) { return null }
        winston.debug('File does not exist, creating it.')
        return await SoundProcessor.mergeSounds(soundParts, filename).catch(winston.error)
    }

    getSoundFilename(soundKind) {
        const dataPath = '/data/sounds'
        const extension = 'ogg'
        return `${dataPath}/${this.id}_${soundKind}.${extension}`
    }

    getSoundParts(soundKind) {
        if (!cardSoundsById[this.id]) { return null }
        if (!soundKind) { soundKind = 'play' }
        if (!cardSoundsById[this.id][soundKind] || cardSoundsById[this.id][soundKind].length < 1) { return null }
        return cardSoundsById[this.id][soundKind].map(s => { return { name: this.getSoundUrl(s.name), delay: s.delay} })
    }

    getSoundUrl(filename) {
        // alternate: http://media.services.zam.com/v1/media/byName/hs/sounds/enus
        const urlBase = 'http://media-hearth.cursecdn.com/audio/card-sounds/sound'
        const extension = 'ogg'
        return `${urlBase}/${filename}.${extension}`
    }

    static getAll() {
        const hsjson = new HearthstoneJSON()
        return new Promise((resolve, reject) => {
            try { hsjson.getLatest(cards => { resolve(cards) }) }
            catch (ex) { reject(ex) }
        })
    }

    static async findByName(name) {
        return new Card(await this.search(name, ['name']).catch(winston.error))
    }

    static async findById(id) {
        return new Card(await this.search(id, ['id']).catch(winston.error))
    }

    static async search(pattern, keys) {
        let uncollectibleOnly = false
        if (pattern.startsWith('@')) {
            pattern = pattern.substring(1)
            uncollectibleOnly = true
        }
        if (!Array.isArray(keys) || keys.length < 1) { keys = ['name'] }
        const allCards = await this.getAll().catch(winston.error)
        const uncollectibleFuse = new Fuse(
            allCards.filter(card => { return !card.collectible }),
            { keys: keys, include: ['score'] }
        )
        const foundUncollectible = uncollectibleFuse.search(pattern)
        if (uncollectibleOnly) { return foundUncollectible[0].item }
        const collectibleFuse = new Fuse(
            allCards.filter(card => { return card.collectible }),
            { keys: keys, include: ['score'] }
        )
        const foundCollectible = collectibleFuse.search(pattern)
        if (foundCollectible.length < 1 && foundUncollectible.length > 0) { return foundUncollectible[0].item }
        if (foundCollectible.length > 0 && foundUncollectible.length < 1) { return foundCollectible[0].item }
        if (foundUncollectible[0].score < foundCollectible[0].score) { return foundUncollectible[0].item }
        return foundCollectible[0].item
    }
}
