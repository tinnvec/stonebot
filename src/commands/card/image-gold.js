import Discord from 'discord.js'
import { Command } from 'discord.js-commando'
import Card from '../../card/card'
import winston from 'winston'

module.exports = class ImageGoldCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'image-gold',
            aliases: ['gold-image', 'gold', 'g', '👑', '💰'],
            group: 'card',
            memberName: 'image-gold',
            description: 'Displays golden card image.',
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
        const embed = new Discord.RichEmbed()
            .setImage(card.getImageUrl('gold'))
        if (msg.channel.typing) { msg.channel.stopTyping() }
        return msg.embed(embed)
        const card = await Card.findByName(args.name).catch(winston.error)
    }
}
