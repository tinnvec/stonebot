import CardData from './card-data'

import toMarkdown from 'to-markdown'
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
        this.dbfId = obj.dbfId
        this.id = obj.id
        
        // Stats
        this.cost = obj.cost
        this.attack = obj.attack
        this.health = obj.health
        this.durability = obj.durability

        // Details
        this.collectible = obj.collectible
        this.type = obj.type
        this.rarity = obj.rarity
        this.playerClass = obj.playerClass
        this.multiClassGroup = obj.multiClassGroup
        this.classes = obj.classes
        this.faction = obj.faction
        this.set = obj.set

        // Texts
        this.name = obj.name
        this.text = obj.text
        this.collectionText = obj.collectionText
        this.flavor = obj.flavor
        this.targetingArrowText = obj.targetingArrowText
        this.howToEarn = obj.howToEarn
        this.howToEarnGolden = obj.howToEarnGolden
        this.artist = obj.artist

        // Other
        this.dust = obj.dust
        this.playRequirements = obj.playRequirements
        this.mechanics = obj.mechanics
        this.entourage = obj.entourage
    }

    getClassColor() {
        return CLASS_COLORS[this.playerClass]
    }

    getOneLineDescription() {
        let desc = ''
        if (this.cost != null) { desc += ` ${this.cost} Mana` }
        if (this.attack) { desc += ` ${this.attack}/${this.health || this.durability}` }
        desc += ` ${this.playerClass.toLowerCase().capitalizeFirstLetter()}`
        desc += ` ${this.type.toLowerCase().capitalizeFirstLetter()}`
        return desc
    }

    getDisplayText() {
        if (this.collectionText) { return toMarkdown(this.collectionText) }
        if (this.text) { return toMarkdown(this.text) }
        return null
    }

    getImageUrl(imgType, artSize) {
        const cardImgBaseUrl = 'http://media.services.zam.com/v1/media/byName/hs/cards/enus'
        artSize = ['256', '512'].includes(artSize) ? artSize : '512'
        const artImgBaseUrl = `https://art.hearthstonejson.com/v1/${artSize}x`
        if (!this.id) { return null }
        switch(imgType) {
        case 'gold':
            return `${cardImgBaseUrl}/animated/${this.id}_premium.gif`
        case 'art':
            return `${artImgBaseUrl}/${this.id}.jpg`
        default:
            return `${cardImgBaseUrl}/${this.id}.png`
        }
    }

    getSoundFilenames(kind) {
        if (!cardSoundsById[this.id]) { return null }
        if (!kind) { kind = 'play' }
        if (!cardSoundsById[this.id][kind] || cardSoundsById[this.id][kind].length < 1) { return null }
        return cardSoundsById[this.id][kind]
    }

    static async findByName(name) {
        return new Card(await CardData.search(name, ['name']).catch(console.error))
    }

    static async findById(id) {
        return new Card(await CardData.search(id, ['id']).catch(console.error))
    }
}

String.prototype.capitalizeFirstLetter = function() {
    return this.charAt(0).toUpperCase() + this.slice(1)
}
