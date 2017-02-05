import Card from '../../card/card'
import { Command } from 'discord.js-commando'
import Discord from 'discord.js'

import winston from 'winston'

const SET_KEYWORDS = [ 'nax', 'naxx', 'gvg', 'brm', 'tgt', 'loe', 'tog', 'wog', 'wotog', 'kara', 'msg', 'msog']
const MAX_RESULTS = 10

module.exports = class SearchCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'search',
            aliases: ['find'],
            group: 'card',
            memberName: 'search',
            description: 'Searches for Hearthstone cards.',
            details: 'Works like Hearthstone collection searching.\n' +
                'General search accross most visible card text in addition to several keywords.\n' +
                `Set keywords: \`${SET_KEYWORDS.join('`, `')}\`.\n` +
                'Value keywords: `attack`, `health`, `mana`, `artist`.\n' +
                'Value keywords take the form of `<keyword>:<value>`.\n' +
                'The `artist` keyword only accepts text without spaces.\n' +
                'All other keywords use a numeric `<value>` with range options.\n' +
                '`<value>` alone means exact value.\n' +
                '`<value>-` means value or lower.\n' +
                '`<value>+` means value or higher.\n' +
                '`<value1>-<value2>` means between value1 and value2.',
            format:'<terms>...',
            examples: [
                'search thermaplugg',
                'search health:2+ battlecry',
                'search artist:blizz',
                'search mana:4- loe',
                'search health:8+',
                'search attack:3-5 mana:2-4 deathrattle'
            ],
            argsType: 'multiple'
        })
    }

    async run(msg, args) {
        if (!msg.channel.typing) { msg.channel.startTyping() }

        let valueKeywords = []
        let words = []
        args.forEach(arg => {
            arg = arg.toLowerCase()
            if (arg.includes(':')) { valueKeywords.push(arg) }
            else { words.push(arg) }
        }, this)

        const searchEmbed = new Discord.RichEmbed()
        winston.debug('Fetching all cards.')
        let cards = await Card.getAll().catch(winston.error)
        cards = cards.filter(card => card.collectible && card.type !== 'HERO')

        if (valueKeywords.length > 0) {
            valueKeywords.forEach(vk => {
                let key = vk.split(':')[0]
                const value = vk.split(':')[1]
                if (key === 'mana') { key = 'cost' }
                let filter
                if (key === 'artist') {
                    winston.debug(`Filtering cards for artist name that includes '${value}'.`)
                    searchEmbed.addField('Artist', `Name contains '${value}'`, true)
                    filter = card => card.artist && card.artist.toLowerCase().includes(value.toLowerCase())
                }
                else {
                    if (value.endsWith('+')) {
                        const num = parseInt(value.slice(0, -1))
                        winston.debug(`Filtering cards for '${key}' >= '${num}'.`)
                        searchEmbed.addField(key.capitalizeFirstLetter(), `${num} or more`, true)
                        filter = card => card[key] >= num
                    }
                    else if (value.endsWith('-')) {
                        const num = parseInt(value.slice(0, -1))
                        winston.debug(`Filtering cards for '${key}' <= '${num}'.`)
                        searchEmbed.addField(key.capitalizeFirstLetter(), `${num} or less`, true)
                        filter = card => card[key] <= num
                    }
                    else if (value.includes('-')) {
                        const min = parseInt(value.split('-')[0])
                        const max = parseInt(value.split('-')[1])
                        winston.debug(`Filtering cards for '${key}' between '${min}' and '${max}'.`)
                        searchEmbed.addField(key.capitalizeFirstLetter(), `Between ${min} and ${max}`, true)
                        filter = card => card[key] >= min && card[key] <= max
                    } else {
                        winston.debug(`Filtering cards for '${key}' == '${value}'.`)
                        searchEmbed.addField(key.capitalizeFirstLetter(), `Equal to ${value}`, true)
                        filter = card => card[key] == parseInt(value)
                    }
                }
                cards = cards.filter(filter)
            }, this)
        }

        if (words.length > 0) {
            const searchTerm = words.join(' ').toLowerCase()
            const searchKeys = ['name', 'playerClass', 'race', 'rarity', 'text', 'type']
            winston.debug(`Searching cards for '${searchTerm}'.`)
            searchEmbed.addField('Search Term', searchTerm, true)
            cards = cards.filter(card => {
                return (searchKeys.some(key => key in card && card[key].toLowerCase().includes(searchTerm)) ||
                (card.set && this.cardSetMatches(card.set, searchTerm)))
            })
        }
        
        winston.debug('Sorting cards by name')
        cards.sort((a, b) => {
            const nameA = a.name.toLowerCase()
            const nameB = b.name.toLowerCase()
            if (nameA < nameB) { return -1 }
            if (nameA > nameB) { return 1 }
            return 0
        })

        let results = '_Sorry, got nothing_'
        if (cards.length > 0) {
            results = `_Found ${cards.length} card${cards.length === 1 ? '' : 's'} that match${cards.length === 1 ? 'es' : ''}._`
            if (cards.length > MAX_RESULTS) { results += ` _Here are the first ${MAX_RESULTS}._` }
            const cardNames = cards.slice(0, MAX_RESULTS).map(c => c.name)
            results += `\n${cardNames.map(n => `[${n}](http://hearthstone.gamepedia.com/${n.replace(/\s/g, '_')})`).join(' | ')}`
        }
        searchEmbed.addField('Results', results)

        return msg.embed(searchEmbed)
            .then(m => { if (m.channel.typing) { m.channel.stopTyping() } })
            .catch(winston.error)
    }

    cardSetMatches(set, searchTerm) {
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
            'CORE': 'basic',
            'EXPERT1': 'classic',
            'REWARD': 'reward',
            'PROMO': 'promotion',
            'NAXX': 'curse of naxxramas',
            'GVG': 'goblins vs gnomes',
            'BRM': 'blackrock mountain',
            'TGT': 'the grand tournament',
            'LOE': 'the league of explorers',
            'OG': 'whispers of the old gods',
            'KARA': 'one night in karazhan',
            'GANGS': 'mean streets of gadgetzan'
        }
        if ((set in officialExpansionNames) && officialExpansionNames[set].includes(searchTerm)) { return true }
        return false
    }
}
