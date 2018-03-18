import { oneLine, stripIndents } from 'common-tags'
import { Message, RichEmbed, TextChannel} from 'discord.js'
import { Command, CommandMessage, CommandoClient } from 'discord.js-commando'
import * as winston from 'winston'

import Card from '../../models/card'
import CardDataService from '../../services/card-data-service'

const SET_KEYWORDS = [ 'nax', 'naxx', 'gvg', 'brm', 'tgt', 'loe', 'tog', 'wog', 'wotog', 'kara', 'msg', 'msog']
const MAX_RESULTS = 10

export default class SearchCommand extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            aliases: ['find'],
            argsType: 'multiple',
            // @ts-ignore: TypeScript reports clientPermissions as being undefined currently
            clientPermissions: ['EMBED_LINKS'],
            description: 'Searches for Hearthstone cards.',
            details: stripIndents`
                Works like Hearthstone collection searching.
                General search accross most visible card text in addition to several keywords.
                Set keywords: \`${SET_KEYWORDS.join('`, `')}\`.
                Value keywords: \`attack\`, \`health\`, \`mana\`, \`artist\`.
                Value keywords take the form of \`<keyword>:<value>\`.
                The \`artist\` keyword only accepts text without spaces.
                All other keywords use a numeric \`<value>\` with range options.
                \`<value>\` alone means exact value.
                \`<value>-\` means value or lower.
                \`<value>+\` means value or higher.
                \`<value1>-<value2>\` means between value1 and value2.
            `,
            examples: [
                'search thermaplugg',
                'search health:2+ battlecry',
                'search artist:blizz',
                'search mana:4- loe',
                'search health:8+',
                'search attack:3-5 mana:2-4 deathrattle'
            ],
            format: '<terms>...',
            group: 'card',
            memberName: 'search',
            name: 'search'
        })
    }

    public async run(msg: CommandMessage, args: string[]) {
        if (!msg.channel.typing) { msg.channel.startTyping() }

        winston.debug('Fetching all cards.')
        let cards: Card[] = await CardDataService.getLatest()

        if (msg.channel.typing) { msg.channel.stopTyping() }

        const valueKeywords: string[] = []
        const words: string[] = []

        args.forEach((arg) => {
            arg = arg.toLowerCase()
            if (arg.includes(':')) {
                valueKeywords.push(arg)
            } else {
                words.push(arg)
            }
        }, this)

        cards = cards.filter((card) => card.collectible && card.type !== 'HERO')
        const searchEmbed: RichEmbed = new RichEmbed()

        if (valueKeywords.length > 0) {
            valueKeywords.forEach((vk) => {
                let key = vk.split(':')[0]
                const value = vk.split(':')[1]
                if (key === 'mana') { key = 'cost' }
                let filter
                if (key === 'artist') {
                    winston.debug(`Filtering cards for artist name that includes '${value}'.`)
                    filter = (card: Card) => {
                        return card.artist && card.artist.toLowerCase().includes(value.toLowerCase())
                    }
                    searchEmbed.addField('Artist', `Name contains '${value}'`, true)
                } else {
                    if (value.endsWith('+')) {
                        const num: number = parseInt(value.slice(0, -1), 10)
                        winston.debug(`Filtering cards for '${key}' >= '${num}'.`)
                        // @ts-ignore: No index defined on Card class currently
                        filter = (card: Card) => card[key] >= num
                        searchEmbed.addField(key, `${num} or more`, true)
                    } else if (value.endsWith('-')) {
                        const num: number = parseInt(value.slice(0, -1), 10)
                        winston.debug(`Filtering cards for '${key}' <= '${num}'.`)
                        // @ts-ignore: No index defined on Card class currently
                        filter = (card: Card) => card[key] <= num
                        searchEmbed.addField(key, `${num} or less`, true)
                    } else if (value.includes('-')) {
                        const min: number = parseInt(value.split('-')[0], 10)
                        const max: number = parseInt(value.split('-')[1], 10)
                        winston.debug(`Filtering cards for '${key}' between '${min}' and '${max}'.`)
                        // @ts-ignore: No index defined on Card class currently
                        filter = (card: Card) => card[key] >= min && card[key] <= max
                        searchEmbed.addField(key, `Between ${min} and ${max}`, true)
                    } else {
                        winston.debug(`Filtering cards for '${key}' == '${value}'.`)
                        // @ts-ignore: No index defined on Card class currently
                        filter = (card: Card) => card[key] === parseInt(value, 10)
                        searchEmbed.addField(key, `Equal to ${value}`, true)
                    }
                }
                cards = cards.filter(filter)
            }, this)
        }

        if (words.length > 0) {
            const searchTerm: string = words.join(' ').toLowerCase()
            const searchKeys: string[] = ['name', 'playerClass', 'race', 'rarity', 'text', 'type']
            winston.debug(`Searching cards for '${searchTerm}'.`)
            cards = cards.filter((card: Card) => {
                // @ts-ignore: No index defined on Card class currently
                return (searchKeys.some((key: string) => card[key] && card[key].toLowerCase().includes(searchTerm)) ||
                (card.set && this.cardSetMatches(card.set, searchTerm)))
            })
            searchEmbed.addField('Search Term', searchTerm, true)
        }

        winston.debug('Sorting cards by name')
        cards.sort((a, b) => {
            const nameA: string = a.name.toLowerCase()
            const nameB: string = b.name.toLowerCase()
            if (nameA < nameB) { return -1 }
            if (nameA > nameB) { return 1 }
            return 0
        })

        let results = '_Sorry, got nothing_'
        if (cards.length > 0) {
            results = oneLine`
                _Found ${cards.length} card${cards.length === 1 ? '' : 's'}
                that match${cards.length === 1 ? 'es' : ''}._
            `
            if (cards.length > MAX_RESULTS) { results += ` _Here are the first ${MAX_RESULTS}._` }
            const cardNames: string[] = cards.slice(0, MAX_RESULTS).map((c: Card) => c.name)
            results += '\n' + cardNames.map((n) => {
                return `[${n}](http://hearthstone.gamepedia.com/${n.replace(/\s/g, '_')})`
            }).join(' | ')
        }
        searchEmbed.addField('Results', results)

        return msg.embed(searchEmbed)
    }

    private cardSetMatches(set: string, searchTerm: string): boolean {
        let searchBy
        switch (searchTerm.trim()) {
        case 'nax':
            searchBy = 'NAXX'
            break
        case 'tog':
        case 'wog':
        case 'wotog':
            searchBy = 'OG'
            break
        case 'msg':
        case 'msog':
            searchBy = 'GANGS'
            break
        default:
            searchBy = searchTerm.trim().toUpperCase()
        }
        if (set === searchBy) { return true }

        const officialExpansionNames: {[set: string]: string} = {
            BRM: 'blackrock mountain',
            CORE: 'basic',
            EXPERT1: 'classic',
            GANGS: 'mean streets of gadgetzan',
            GVG: 'goblins vs gnomes',
            KARA: 'one night in karazhan',
            LOE: 'the league of explorers',
            NAXX: 'curse of naxxramas',
            OG: 'whispers of the old gods',
            PROMO: 'promotion',
            REWARD: 'reward',
            TGT: 'the grand tournament'
        }

        if (set in officialExpansionNames &&
            officialExpansionNames[set].includes(searchTerm)) {
            return true
        }

        return false
    }
}
