import Fuse from 'fuse.js'
import HearthstoneJSON from 'hearthstonejson'

import toMarkdown from 'to-markdown'

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
        if (foundUncollectible[0].score < foundCollectible[0].score) { return foundUncollectible[0].item }
        return foundCollectible[0].item
    }

    static formatTextOutput(card, addon) {
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
}

String.prototype.capitalizeFirstLetter = function() {
    return this.charAt(0).toUpperCase() + this.slice(1)
}
