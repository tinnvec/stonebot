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
        const filename = await card.getImage().catch(winston.error)
        if (msg.channel.typing) { msg.channel.stopTyping() }
        if (!filename) { return msg.reply(`sorry, there was a problem getting the image for ${card.name}`) }
        return msg.say('', { file: { attachment: filename } }).catch(winston.error)
    }
}
