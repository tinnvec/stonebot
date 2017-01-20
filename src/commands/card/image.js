import Discord from 'discord.js'
import { Command } from 'discord.js-commando'
import Card from '../../card/card'
import winston from 'winston'

module.exports = class ImageCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'image',
            aliases: ['img', 'i', '📷', '📸'],
            group: 'card',
            memberName: 'image',
            description: 'Displays card image.',
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
        card.getImageUrl('image', imgUrl => {
            if (msg.channel.typing) { msg.channel.stopTyping() }
            if (!imgUrl) { return msg.reply(`sorry, I couldn't find an image for ${card.name}`) }
            return msg.say(imgUrl)
        })
    }
}
