import CardData from './card-data'

import http from 'http'
import toMarkdown from 'to-markdown'
import url from 'url'
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
        // this.multiClassGroup = obj.multiClassGroup
        // this.classes = obj.classes
        // this.faction = obj.faction
        // this.set = obj.set

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

    getSoundFilenames(kind) {
        if (!cardSoundsById[this.id]) { return null }
        if (!kind) { kind = 'play' }
        if (!cardSoundsById[this.id][kind] || cardSoundsById[this.id][kind].length < 1) { return null }
        return cardSoundsById[this.id][kind]
    }

    getImageUrl(imgType, callback) {
        const cardImgBaseUrl = 'http://media.services.zam.com/v1/media/byName/hs/cards/enus'
        const artSize = 512 // or 256
        const artImgBaseUrl = `http://art.hearthstonejson.com/v1/${artSize}x`
        let imgUrl
        if (!this.id) { return callback(null) }
        switch(imgType) {
        case 'gold':
            imgUrl = `${cardImgBaseUrl}/animated/${this.id}_premium.gif`
            break
        case 'art':
            imgUrl = `${artImgBaseUrl}/${this.id}.jpg`
            break
        default:
            imgUrl = `${cardImgBaseUrl}/${this.id}.png`
        }
        const req = http.request({
            method: 'HEAD',
            hostname: url.parse(imgUrl).hostname,
            path: url.parse(imgUrl).pathname
        })
        req.on('response', res => {
            if (res.statusCode !== 200) { return callback(null) }
            return callback(imgUrl)
        })
        req.on('error', winston.error)
        req.end()
    }

    static async findByName(name) {
        return new Card(await CardData.search(name, ['name']).catch(winston.error))
    }

    static async findById(id) {
        return new Card(await CardData.search(id, ['id']).catch(winston.error))
    }
}

String.prototype.capitalizeFirstLetter = function() {
    return this.charAt(0).toUpperCase() + this.slice(1)
}
