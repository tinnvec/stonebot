import Card from '../../card/card'
import { Command } from 'discord.js-commando'

import { cardName } from '../../command-arguments'
import winston from 'winston'

module.exports = class TextCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'text',
            aliases: ['txt', 't', 'card', 'c'],
            group: 'card',
            memberName: 'text',
            description: 'Displays card text.',
            examples: [
                'text frostbolt',
                't gadgetzan auctioneer',
                'card yshaarj',
                'c tinyfin'
            ],
            args: [ cardName ]
        })
    }

    async run(msg, args) {
        if (!msg.channel.typing) { msg.channel.startTyping() }
        const card = await Card.findByName(args.cardName).catch(winston.error)
        return (card ? msg.embed({
            title: card.name,
            description: card.description,
            url: card.url,
            color: card.classColor,
            fields: [{ name: 'Text', value: card.text }]
        }) : msg.reply(`sorry, I couldn't find a card with a name like '${args.cardName}'`))
        .then(m => { if (m.channel.typing) { m.channel.stopTyping() } })
        .catch(winston.error)
    }
}
