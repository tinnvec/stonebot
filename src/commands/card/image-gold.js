import Card from '../../card/card'
import { Command } from 'discord.js-commando'
import MessageManager from '../../message-manager'

import { cardName } from '../../command-arguments'
import winston from 'winston'

module.exports = class ImageGoldCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'image-gold',
            aliases: ['gold-image', 'gold', 'g', '👑'],
            group: 'card',
            memberName: 'image-gold',
            description: 'Displays golden card image.',
            examples: ['image-gold twisting nether'],
            args: [ cardName ]
        })
    }

    async run(msg, args) {
        if (!msg.channel.typing) { msg.channel.startTyping() }
        const card = await Card.findByName(args.cardName).catch(winston.error)
        const filename = await card.getImage('gold').catch(winston.error)
        await MessageManager.deleteArgumentPromptMessages(msg)
        const response = filename ?
            msg.say('', { file: { attachment: filename } }) :
            msg.reply(`sorry, there was a problem getting the golden image for ${card.name}`)
        return response
            .then(m => { if (m.channel.typing) { m.channel.stopTyping() } })
            .catch(winston.error)
    }
}
