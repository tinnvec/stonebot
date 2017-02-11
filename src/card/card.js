import FileManager from '../file-manager'
import Fuse from 'fuse.js'
import HearthstoneJSON from 'hearthstonejson'
import SoundProcessor from '../sound-processor'

import fs from 'fs'
import toMarkdown from 'to-markdown'
import winston from 'winston'

import cardSoundsById from './card-sounds-by-id'

const CLASS_COLORS = {
    'WARRIOR': 12852795, // #C41E3B
    'SHAMAN': 31454, // #007ADE
    'ROGUE': 0, // #000000
    'PALADIN': 16774505, // #FFF569
    'HUNTER': 11261043, // #ABD473
    'DRUID': 13081710, // #C79C6E
    'WARLOCK': 9732809, // #9482C9
    'MAGE': 6933744, // #69CCF0
    'PRIEST': 16777215, // #FFFFFF
    'NEUTRAL': 8421504 //#808080
}

export default class Card {
    constructor(obj) {
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

    get artist() {
        return this._artist || '_[unknown]_'
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

    get url() {
        return `http://hearthstone.gamepedia.com/${this.name.replace(/\s/g, '_')}`
    }

    async getImage(imageType) {
        const filename = this.getImageFilename(imageType)
        if (fs.existsSync(filename)) {
            winston.debug('Image exits, using it.')
            return filename
        }
        winston.debug('Image does not exist, downloading it.')
        const res = await FileManager.downloadFile(this.getImageUrl(imageType), filename).catch(winston.error)
        if (!res || !res.startsWith('/data')) {
            winston.debug(`Error downloading image: ${res}`)
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
            winston.debug('Sound exits, using it.')
            return filename
        }
        const soundParts = this.getSoundParts(soundKind)
        if (!soundParts) { return null }
        winston.debug('Sound does not exist, creating it.')
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
        return encodeURI(`${urlBase}/${filename}.${extension}`)
    }

    static getAll() {
        const hsjson = new HearthstoneJSON()
        return new Promise((resolve, reject) => {
            try { hsjson.getLatest(cards => { resolve(cards) }) }
            catch (ex) { reject(ex) }
        })
    }

    static async findByName(name) {
        const res = await this.search(name, ['name']).catch(winston.error)
        if (!res) { return null }
        return new Card(res)
    }

    static async findById(id) {
        const res = await this.search(id, ['id']).catch(winston.error)
        if (!res) { return null }
        return new Card(res)
    }

    static async search(pattern, keys) {
        let uncollectibleOnly = false
        if (pattern.startsWith('@')) {
            winston.debug('Using uncollectible-only search mode.')
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
        if (foundCollectible.length < 1 && foundUncollectible.length < 1) { return null }
        if (foundCollectible.length < 1) { return foundUncollectible[0].item }
        if (foundUncollectible.length < 1) { return foundCollectible[0].item }
        if (foundUncollectible[0].score < foundCollectible[0].score) { return foundUncollectible[0].item }
        return foundCollectible[0].item
    }
}
