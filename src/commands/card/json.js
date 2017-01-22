import Card from '../../card/card'
import { Command } from 'discord.js-commando'

import { cardName } from '../../command-arguments'
import winston from 'winston'

module.exports = class JSONCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'json',
            aliases: ['dev', 'info', '🗡'],
            group: 'card',
            memberName: 'json',
            description: 'Displays JSON inormation for card.',
            examples: ['json jade golem'],
            args: [ cardName ]
        })
    }

    async run(msg, args) {
        if (!msg.channel.typing) { msg.channel.startTyping() }
        const card = await Card.findByName(args.cardName).catch(winston.error)
        let result = '```json\n'
        result += `${JSON.stringify(card.json, null, '  ')}\n`
        result += '```'
        if (msg.channel.typing) { msg.channel.stopTyping() }
        return msg.say(result).catch(winston.error)
    }
}
