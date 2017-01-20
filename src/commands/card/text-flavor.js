import Discord from 'discord.js'
import { Command } from 'discord.js-commando'
import Card from '../../card/card'
import winston from 'winston'

module.exports = class TextFlavorCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'text-flavor',
            aliases: ['flavor-text', 'flavor', 'f', '🥓', '🍗', '🍿', '🍰'],
            group: 'card',
            memberName: 'text-flavor',
            description: 'Displays card text and flavor text.',
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
            .setColor(card.getClassColor())
            .setTitle(card.name)
            .setDescription(card.getOneLineDescription())
        if (card.getDisplayText()) { embed.addField('Text', card.getDisplayText()) }
        if (card.flavor) { embed.addField('Flavor', card.flavor) }
        if (msg.channel.typing) { msg.channel.stopTyping() }
        return msg.embed(embed)
    }
}
