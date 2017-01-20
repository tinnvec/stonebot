import Discord from 'discord.js'
import { Command } from 'discord.js-commando'
import Card from '../../card/card'
import winston from 'winston'

module.exports = class TextCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'text',
            aliases: ['card', 'txt', 't', 'c', '🎴', '🃏', '📝', '📜', '📃'],
            group: 'card',
            memberName: 'text',
            description: 'Displays card text.',
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
        if (msg.channel.typing) { msg.channel.stopTyping() }
        return msg.embed(embed)
    }
}
