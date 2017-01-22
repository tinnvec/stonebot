import Card from '../../card/card'
import { Command } from 'discord.js-commando'

import { cardName } from '../../command-arguments'
import winston from 'winston'

module.exports = class ImageCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'image',
            aliases: ['img', 'i', '📷', '📸'],
            group: 'card',
            memberName: 'image',
            description: 'Displays card image.',
            examples: ['image fiery war axe'],
            args: [ cardName ]
        })
    }

    async run(msg, args) {
        if (!msg.channel.typing) { msg.channel.startTyping() }
        const card = await Card.findByName(args.cardName).catch(winston.error)
        card.getImageUrl('image', imgUrl => {
            if (msg.channel.typing) { msg.channel.stopTyping() }
            if (!imgUrl) { return msg.reply(`sorry, I couldn't find an image for ${card.name}`).catch(winston.error) }
            return msg.say(imgUrl).catch(winston.error)
        })
    }
}
