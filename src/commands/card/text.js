import Card from '../../card/card'
import { Command } from 'discord.js-commando'
import Discord from 'discord.js'
import MessageManager from '../../message-manager'

import { cardName } from '../../command-arguments'
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
            args: [ cardName ]
        })
    }

    async run(msg, args) {
        if (!msg.channel.typing) { msg.channel.startTyping() }
        const card = await Card.findByName(args.cardName).catch(winston.error)
        const embed = new Discord.RichEmbed()
            .setColor(card.classColor)
            .setTitle(card.name)
            .setDescription(card.description)
            .addField('Text', card.text)
        await MessageManager.deleteArgumentPromptMessages(msg)
        return msg.embed(embed)
            .then(m => { if (m.channel.typing) { m.channel.stopTyping() } })
            .catch(winston.error)
    }
}
