import * as Fuse from 'fuse.js'
import HearthstoneJSON, { CardData } from 'hearthstonejson-client'
import * as winston from 'winston'

import Card from '../models/card'

export default class CardDataService {
    public static findOne(pattern: string, keys: string[] = ['name']): Promise<Card> {
        return new Promise<Card>((resolve, reject) => {
            this.getLatest().then((cards: Card[]) => {
                const uncollectibleFuse: Fuse = new Fuse(
                    cards.filter((c: Card) => !c.collectible),
                    { keys, includeScore: true }
                )

                let uncollectibleOnly: boolean = false
                if (pattern.startsWith('@')) {
                    pattern = pattern.substring(1)
                    uncollectibleOnly = true
                }

                const foundUncollectible: CardFuseResult[] = uncollectibleFuse.search<CardFuseResult>(pattern)
                if (uncollectibleOnly) {
                    return resolve(foundUncollectible[0] ? foundUncollectible[0].item as Card : undefined)
                }

                const collectibleFuse = new Fuse(
                    cards.filter((c: Card) => c.collectible),
                    { keys, includeScore: true }
                )
                const foundCollectible: CardFuseResult[] = collectibleFuse.search<CardFuseResult>(pattern)

                if (foundCollectible.length < 1) {
                    return resolve(foundUncollectible[0] ? foundUncollectible[0].item as Card : undefined)
                }

                if (foundUncollectible.length < 1) {
                    return resolve(foundCollectible[0] ? foundCollectible[0].item as Card : undefined)
                }

                if (foundUncollectible[0].score < foundCollectible[0].score) {
                    return resolve(foundUncollectible[0].item)
                }
                return resolve(foundCollectible[0].item)
            }).catch((err) => reject(err))
        })
    }

    public static getLatest(): Promise<Card[]> {
        return new Promise<Card[]>((resolve, reject) => {
            try {
                this.hsjson.getLatest().then((jsonCards: CardData[]) =>
                    resolve(jsonCards.map((jCard: CardData) => new Card(jCard)))
                )
            } catch (ex) { reject(ex) }
        })
    }

    private static hsjson = new HearthstoneJSON()
}
