import { oneLine } from 'common-tags'
import { Message, RichEmbed, TextChannel} from 'discord.js'
import { Command, CommandMessage, CommandoClient } from 'discord.js-commando'
import * as winston from 'winston'

import Card from '../../structures/card'
import CardData from '../../structures/card-data'

const SET_KEYWORDS = [ 'nax', 'naxx', 'gvg', 'brm', 'tgt', 'loe', 'tog', 'wog', 'wotog', 'kara', 'msg', 'msog']
const MAX_RESULTS = 10

export default class SearchCommand extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            aliases: ['find'],
            argsType: 'multiple',
            description: 'Searches for Hearthstone cards.',
            details: oneLine`
                Works like Hearthstone collection searching.\n
                General search accross most visible card text in addition to several keywords.\n
                Set keywords: \`${SET_KEYWORDS.join('`, `')}\`.\n
                Value keywords: \`attack\`, \`health\`, \`mana\`, \`artist\`.\n
                Value keywords take the form of \`<keyword>:<value>\`.\n
                The \`artist\` keyword only accepts text without spaces.\n
                All other keywords use a numeric \`<value>\` with range options.\n
                \`<value>\` alone means exact value.\n
                \`<value>-\` means value or lower.\n
                \`<value>+\` means value or higher.\n
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
        if (msg.channel instanceof TextChannel &&
            !msg.channel.permissionsFor(this.client.user).hasPermission('SEND_MESSAGES')) {
            return
        }

        if (!msg.channel.typing) { msg.channel.startTyping() }
        winston.debug('Fetching all cards.')
        let cards: Card[] = await CardData.getLatest()
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
                        const num: Number = parseInt(value.slice(0, -1), 10)
                        winston.debug(`Filtering cards for '${key}' >= '${num}'.`)
                        filter = (card: Card) => card[key] >= num
                        searchEmbed.addField(key, `${num} or more`, true)
                    } else if (value.endsWith('-')) {
                        const num: Number = parseInt(value.slice(0, -1), 10)
                        winston.debug(`Filtering cards for '${key}' <= '${num}'.`)
                        filter = (card: Card) => card[key] <= num
                        searchEmbed.addField(key, `${num} or less`, true)
                    } else if (value.includes('-')) {
                        const min: Number = parseInt(value.split('-')[0], 10)
                        const max: Number = parseInt(value.split('-')[1], 10)
                        winston.debug(`Filtering cards for '${key}' between '${min}' and '${max}'.`)
                        filter = (card: Card) => card[key] >= min && card[key] <= max
                        searchEmbed.addField(key, `Between ${min} and ${max}`, true)
                    } else {
                        winston.debug(`Filtering cards for '${key}' == '${value}'.`)
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
                return (searchKeys.some((key: string) => key in card && card[key].toLowerCase().includes(searchTerm)) ||
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

        if (msg.channel instanceof TextChannel &&
            !msg.channel.permissionsFor(this.client.user).hasPermission('EMBED_LINKS')) {
            return msg.say(
                valueKeywords.map((vk) => {
                    const k: string = vk.split(':')[0]
                    const v: string = vk.split(':')[1]
                    if (k === 'artist') { return `**Artist**\nName contains '${v}'` }
                    if (v.endsWith('+')) { return `**${k}**\n${v.slice(0, -1)} or more`}
                    if (v.endsWith('-')) { return `**${k}**\n${v.slice(0, -1)} or less`}
                    if (v.includes('-')) { return `**${k}**\nBetween ${v.split('-')[0]} and ${v.split('-')[1]}`}
                    return `**${k}**\nEqual to ${v}`
                }).join('\n') + '\n' +
                (words.length > 0 ? `**Search Term**\n${words.join(' ').toLowerCase()}\n` : '') +
                '\n**Results**\n' +
                (cards.length > 0 ?
                    `_Found ${cards.length} card${cards.length === 1 ? '' : 's'}` +
                    ` that match${cards.length === 1 ? 'es' : ''}._` +
                    (cards.length > MAX_RESULTS ? ` _Here are the first ${MAX_RESULTS}._\n` : '\n') +
                    cards.slice(0, MAX_RESULTS).map((c) => c.name).join(' | ') :
                    '_Sorry, got nothing_')
            ).catch(winston.error)
        }

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
        return msg.embed(searchEmbed).catch(winston.error)
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

        const officialExpansionNames = {
            'BRM': 'blackrock mountain',
            'CORE': 'basic',
            'EXPERT1': 'classic',
            'GANGS': 'mean streets of gadgetzan',
            'GVG': 'goblins vs gnomes',
            'KARA': 'one night in karazhan',
            'LOE': 'the league of explorers',
            'NAXX': 'curse of naxxramas',
            'OG': 'whispers of the old gods',
            'PROMO': 'promotion',
            'REWARD': 'reward',
            'TGT': 'the grand tournament'
        }

        if (set in officialExpansionNames &&
            officialExpansionNames[set].includes(searchTerm)) {
            return true
        }

        return false
    }
}
