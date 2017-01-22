import Card from '../../card/card'
import { Command } from 'discord.js-commando'

import winston from 'winston'

module.exports = class ImageGoldCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'image-gold',
            aliases: ['gold-image', 'gold', 'g', '👑', '💰'],
            group: 'card',
            memberName: 'image-gold',
            description: 'Displays golden card image.',
            examples: ['image-gold twisting nether'],
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
        card.getImageUrl('gold', imgUrl => {
            if (msg.channel.typing) { msg.channel.stopTyping() }
            if (!imgUrl) { return msg.reply(`sorry, I couldn't find a gold image for ${card.name}`) }
            return msg.say(imgUrl).catch(winston.error)
        })
    }
}
