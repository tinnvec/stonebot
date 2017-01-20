import Card from '../../card'
import { Command } from 'discord.js-commando'
import Discord from 'discord.js'

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
        const embed = new Discord.RichEmbed()
            .setColor(card.classColor)
            .setTitle(card.name)
            .setDescription(card.description)
            .addField('Text', card.text)
            .addField('Flavor', card.flavor)
        if (msg.channel.typing) { msg.channel.stopTyping() }
        return msg.embed(embed)
    }
}
