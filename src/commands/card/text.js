import Card from '../../card/card'
import { Command } from 'discord.js-commando'
import Discord from 'discord.js'

import winston from 'winston'

module.exports = class TextCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'text',
            aliases: ['card', 'txt', 't', 'c', '🎴', '🃏', '📝', '📜', '📃'],
            group: 'card',
            memberName: 'text',
            description: 'Displays card text.',
            examples: ['text frostbolt'],
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
        if (msg.channel.typing) { msg.channel.stopTyping() }
        return msg.embed(embed).catch(winston.error)
    }
}
