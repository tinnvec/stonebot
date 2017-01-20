import Fuse from 'fuse.js'
import HearthstoneJSON from 'hearthstonejson'

import winston from 'winston'

export default class CardData {
    static getAll() {
        const hsjson = new HearthstoneJSON()
        return new Promise((resolve, reject) => {
            try { hsjson.getLatest(cards => { resolve(cards) }) }
            catch (ex) { reject(ex) }
        })
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
