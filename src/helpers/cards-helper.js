import Discord from 'discord.js'
import Fuse from 'fuse.js'
import HearthstoneJSON from 'hearthstonejson'

import toMarkdown from 'to-markdown'

// RGB
const CLASS_COLORS = {
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

export default class CardsHelper {
    static getAll() {
        const hsjson = new HearthstoneJSON()
        return new Promise((resolve, reject) => {
            try {
                hsjson.getLatest(cards => { resolve(cards) })
            } catch (ex) {
                reject(ex)
            }
        })
    }

    static detectMentions(text) {
        let pattern = /:{2}([^:\?]+)\??([^:]*):{2}/g
        let matches = []
        let match = pattern.exec(text)
        while (match) {
            matches.push(match)
            match = pattern.exec(text)
        }
        return matches
    }

    static async search(pattern) {
        let uncollectibleOnly = false
        if (pattern.startsWith('@')) {
            pattern = pattern.substring(1)
            uncollectibleOnly = true
        }
        let allCards = await this.getAll().catch(console.error)

        let uncollectibleFuse = new Fuse(
            allCards.filter(card => { return !card.collectible }),
            { keys: ['name'], include: ['score'] }
        )
        let foundUncollectible = uncollectibleFuse.search(pattern)
        if (uncollectibleOnly) { return foundUncollectible[0].item }

        let collectibleFuse = new Fuse(
            allCards.filter(card => { return card.collectible }),
            { keys: ['name'], include: ['score'] }
        )
        let foundCollectible = collectibleFuse.search(pattern)
        
        if (foundCollectible.length < 1 && foundUncollectible.length > 0) { return foundUncollectible[0].item }
        if (foundCollectible.length > 0 && foundUncollectible.length < 1) { return foundCollectible[0].item }
        if (foundUncollectible[0].score < foundCollectible[0].score) { return foundUncollectible[0].item }
        return foundCollectible[0].item
    }

    static getTextOutput(card, addon) {
        if (addon === 'image') {
            return `http://media.services.zam.com/v1/media/byName/hs/cards/enus/${card.id}.png`
        }
        if (addon === 'gold') {
            return `http://media.services.zam.com/v1/media/byName/hs/cards/enus/animated/${card.id}_premium.gif`
        }
        if (addon === 'art') {
            return `https://art.hearthstonejson.com/v1/512x/${card.id}.jpg`
        }

        let result = `${card.name} -`
        if (card.cost) { result += ` ${card.cost} Mana` }
        if (card.attack) { result += ` ${card.attack}/${card.health || card.durability}` }
        result += ` ${card.playerClass.toLowerCase().capitalizeFirstLetter()}`
        result += ` ${card.type.toLowerCase().capitalizeFirstLetter()}`
        if (card.collectionText) { result += `\n${toMarkdown(card.collectionText)}` }
        else if (card.text) { result += `\n${toMarkdown(card.text)}` }
        if (addon === 'flavor' && card.flavor) { result += `\n${card.flavor}` }
        return result
    }

    static getEmbedObject(card, addon) {
        let res = new Discord.RichEmbed()
        if (addon === 'image') {
            return res.setImage(`http://media.services.zam.com/v1/media/byName/hs/cards/enus/${card.id}.png`)
        }
        if (addon === 'gold') {
            return res.setImage(`http://media.services.zam.com/v1/media/byName/hs/cards/enus/animated/${card.id}_premium.gif`)
        }
        if (addon === 'art') { res.setImage(`https://art.hearthstonejson.com/v1/512x/${card.id}.jpg`) }

        res.setTitle(card.name).setColor(CLASS_COLORS[card.playerClass])

        let desc = ''
        if (card.cost != null) { desc += ` ${card.cost} Mana` }
        if (card.attack) { desc += ` ${card.attack}/${card.health || card.durability}` }
        desc += ` ${card.playerClass.toLowerCase().capitalizeFirstLetter()}`
        desc += ` ${card.type.toLowerCase().capitalizeFirstLetter()}`
        res.setDescription(desc)

        if (card.collectionText) { res.addField('Text', toMarkdown(card.collectionText)) }
        else if (card.text) { res.addField('Text', toMarkdown(card.text)) }
        if (addon === 'flavor' && card.flavor) { res.addField('Flavor', card.flavor) }

        return res
    }
}

String.prototype.capitalizeFirstLetter = function() {
    return this.charAt(0).toUpperCase() + this.slice(1)
}
