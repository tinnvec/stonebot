interface Card {
    cardClass: string
    dbfId: number
    id: string
    name: string
    playerClass: string
    set: string
    type: string

    artist: string
    collectible: boolean
    flavor: string
    json: HearthstoneJSONCard
    text: string

    attack?: number
    collectionText?: string
    cost?: number
    durability?: number
    elite?: boolean
    entourage?: string[]
    faction?: string
    health?: number
    hideStats?: boolean
    howToEarn?: string
    howToEarnGolden?: string
    mechanics?: string[]
    playRequirements?: object
    race?: string
    rarity?: string
    referencedTags?: string[]

    constructor(obj: HearthstoneJSONCard): Card

    classColor: string
    description: string
    displayText: string
    wikiUrl: string

    getImageFile(imgType?: 'art' | 'gold' | 'image'): Promise<string | undefined>
    getSoundFile(sndType?: string): Promise<string>

    cardTextToMarkdown(text: string): string
    capitalizeFirstLetter(input: string): string
}

interface CardFuseResult {
    item: Card,
    score: number
}

interface Config {
    token: string,
    owner: string | string[],
    inviteUrl: string,
    prefix: string,
    logLevel: 'error' | 'warn' | 'info' | 'verbose' | 'debug' | 'silly'
}

interface HearthstoneJSONCard {
    cardClass: string,
    dbfId: number,
    id: string,
    name: string,
    playerClass: string,
    set: string,
    type: string,

    artist?: string,
    attack?: number,
    collectible?: boolean,
    collectionText?: string,
    cost?: number,
    durability?: number,
    elite?: boolean,
    entourage?: string[],
    faction?: string,
    flavor?: string,
    health?: number,
    hideStats?: boolean,
    howToEarn?: string,
    howToEarnGolden?: string,
    mechanics?: string[],
    playRequirements?: object,
    race?: string,
    rarity?: string,
    referencedTags?: string[],
    text?: string
}

interface QuestEntry {
    id: number,
    server: string,
    user: string
}