import Card from '../../card/card'
import { Command } from 'discord.js-commando'
import MessageManager from '../../message-manager'

import { cardName } from '../../command-arguments'
import winston from 'winston'

module.exports = class JSONCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'json',
            group: 'card',
            memberName: 'json',
            description: 'Displays JSON inormation for card.',
            examples: ['json jade golem'],
            args: [ cardName ]
        })
    }

    async run(msg, args) {
        await MessageManager.deleteArgumentPromptMessages(msg).catch(winston.error)
        if (!msg.channel.typing) { msg.channel.startTyping() }

        let reply
        const card = await Card.findByName(args.cardName).catch(winston.error)
        if (!card) { reply =`sorry, I couldn't find a card with a name like '${args.cardName}'` }

        return (reply ? msg.reply(reply) : msg.code('json', JSON.stringify(card.json, null, '  ')))
            .then(m => { if (m.channel.typing) { m.channel.stopTyping() } })
            .catch(winston.error)
    }
}