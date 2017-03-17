import * as Fuse from 'fuse.js'
import HearthstoneJSON from 'hearthstonejson'
import * as winston from 'winston'

import Card from './card'

export type HearthstoneJSONCard = {
    cardClass: string,
    dbfId: Number,
    id: string,
    name: string,
    playerClass: string,
    set: string,
    type: string,

    artist?: string,
    attack?: Number,
    collectible?: boolean,
    collectionText?: string,
    cost?: Number,
    durability?: Number,
    elite?: boolean,
    entourage?: string[],
    faction?: string,
    flavor?: string,
    health?: Number,
    hideStats?: boolean,
    howToEarn?: string,
    howToEarnGolden?: string,
    mechanics?: string[],
    playRequirements?: Object,
    race?: string,
    rarity?: string,
    referencedTags?: string[],
    text?: string
}

export type CardFuseResult = {
    item: Card,
    score: Number
}

export default class CardData {
    public static findOne(pattern: string, keys: string[] = ['name']): Promise<Card> {
        return new Promise<Card>((resolve, reject) => {
            this.getLatest().then((cards: Card[]) => {
                const uncollectibleFuse: Fuse = new Fuse(
                    cards.filter((c: Card) => !c.collectible),
                    { keys, include: ['score'] }
                )

                let uncollectibleOnly: boolean = false
                if (pattern.startsWith('@')) {
                    pattern = pattern.substring(1)
                    uncollectibleOnly = true
                }

                const foundUncollectible: CardFuseResult[] = uncollectibleFuse.search<CardFuseResult>(pattern)
                if (uncollectibleOnly) { return resolve(foundUncollectible[0].item || undefined) }

                const collectibleFuse = new Fuse(
                    cards.filter((c: Card) => c.collectible),
                    { keys, include: ['score'] }
                )
                const foundCollectible: CardFuseResult[] = collectibleFuse.search<CardFuseResult>(pattern)

                if (foundCollectible.length < 1) { return resolve(foundUncollectible[0].item || undefined) }
                if (foundUncollectible.length < 1) { return resolve(foundCollectible[0].item || undefined) }
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
                this.hsjson.getLatest((jsonCards: HearthstoneJSONCard[]) =>
                    resolve(jsonCards.map((jCard: HearthstoneJSONCard) => new Card(jCard)))
                )
            } catch (ex) { reject(ex) }
        })
    }

    private static hsjson = new HearthstoneJSON()
}
