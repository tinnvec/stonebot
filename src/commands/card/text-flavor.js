import Card from '../../card/card'
import { Command } from 'discord.js-commando'
import Discord from 'discord.js'
import MessageManager from '../../message-manager'

import { cardName } from '../../command-arguments'
import winston from 'winston'

module.exports = class TextFlavorCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'text-flavor',
            aliases: ['flavor-text', 'flavor', 'f', '🥓', '🍗', '🍿', '🍰'],
            group: 'card',
            memberName: 'text-flavor',
            description: 'Displays card text and flavor text.',
            examples: ['text-flavor devolve'],
            args: [ cardName ]
        })
    }

    async run(msg, args) {
        if (!msg.channel.typing) { msg.channel.startTyping() }

        const card = await Card.findByName(args.cardName).catch(winston.error)
        if (!card) {
            await MessageManager.deleteArgumentPromptMessages(msg).catch(winston.error)
            return msg.reply(`sorry, I couldn't find a card with a name like '${args.cardName}'`)
                .then(m => { if (m.channel.typing) { m.channel.stopTyping() } })
                .catch(winston.error)
        }
        
        const embed = new Discord.RichEmbed()
            .setColor(card.classColor)
            .setTitle(card.name)
            .setDescription(card.description)
            .addField('Text', card.text)
            .addField('Flavor', card.flavor)
        await MessageManager.deleteArgumentPromptMessages(msg).catch(winston.error)
        return msg.embed(embed)
            .then(m => { if (m.channel.typing) { m.channel.stopTyping() } })
            .catch(winston.error)
    }
}
