import Card from '../../card'
import { Command } from 'discord.js-commando'
import Discord from 'discord.js'

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
            args: [
                {
                    key: 'name',
                    prompt: 'what card are you searching for?\n',
                    type: 'string'
                }
            ]
        })
    }

    async run(msg, args) {
        if (!msg.channel.typing) { msg.channel.startTyping() }
        const card = await Card.findByName(args.name).catch(winston.error)
        let result = '```json\n'
        result += `${JSON.stringify(card.json, null, '  ')}\n`
        result += '```'
        if (msg.channel.typing) { msg.channel.stopTyping() }
        return msg.say(result)
    }
}
