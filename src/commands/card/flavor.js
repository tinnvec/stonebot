import Card from '../../card/card'
import { Command } from 'discord.js-commando'
import Discord from 'discord.js'
import MessageManager from '../../message-manager'

import { cardName } from '../../command-arguments'
import winston from 'winston'

module.exports = class TFlavorCommand extends Command {
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

        let reply
        const card = await Card.findByName(args.cardName).catch(winston.error)
        if (!card) { reply = `sorry, I couldn't find a card with a name like '${args.cardName}'` }

        return (reply ?
            msg.reply(reply) :
            msg.embed(new Discord.RichEmbed()
                .setColor(card.classColor)
                .setTitle(card.name)
                .setDescription(card.description)
                .addField('Text', card.text)
                .addField('Flavor', card.flavor))
            ).then(m => { if (m.channel.typing) { m.channel.stopTyping() } })
            .catch(winston.error)
    }
}
