import Card from '../../card/card'
import { Command } from 'discord.js-commando'
import MessageManager from '../../message-manager'

import { cardName } from '../../command-arguments'
import winston from 'winston'

module.exports = class FlavorCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'flavor',
            aliases: ['f', 'flavor-text'],
            group: 'card',
            memberName: 'flavor',
            description: 'Displays card text and flavor text.',
            examples: [
                'flavor devolve',
                'f small time recruits'
            ],
            args: [ cardName ]
        })
    }

    async run(msg, args) {
        await MessageManager.deleteArgumentPromptMessages(msg).catch(winston.error)
        if (!msg.channel.typing) { msg.channel.startTyping() }
        const card = await Card.findByName(args.cardName).catch(winston.error)
        return (card ? msg.embed({
            title: card.name,
            description: card.description,
            url: card.url,
            color: card.classColor,
            fields: [
                { name: 'Text', value: card.text },
                { name: 'Flavor', value: card.flavor }
            ]
        }) : msg.reply(`sorry, I couldn't find a card with a name like '${args.cardName}'`))
        .then(m => { if (m.channel.typing) { m.channel.stopTyping() } })
        .catch(winston.error)
    }
}
