import Card from '../../card/card'
import { Command } from 'discord.js-commando'
import MessageManager from '../../message-manager'

import { cardName } from '../../command-arguments'
import winston from 'winston'

module.exports = class ImageArtCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'image-art',
            aliases: ['art-image', 'art', 'a', '🖼', '🎨'],
            group: 'card',
            memberName: 'image-art',
            description: 'Displays the artist and full art from the card.',
            examples: ['image-art raza'],
            args: [ cardName ]
        })
    }

    async run(msg, args) {
        if (!msg.channel.typing) { msg.channel.startTyping() }
        const card = await Card.findByName(args.cardName).catch(winston.error)
        const filename = await card.getImage('art').catch(winston.error)
        await MessageManager.deleteArgumentPromptMessages(msg)
        const response = filename ?
            msg.say(`**${card.name}**\n**Artist**: ${card.artist}`, { file: { attachment: filename } }) :
            msg.reply(`sorry, there was a problem getting the art for ${card.name}`)
        return response
            .then(m => { if (m.channel.typing) { m.channel.stopTyping() } })
            .catch(winston.error)
    }
}
