import Card from '../../card/card'
import { Command } from 'discord.js-commando'
import MessageManager from '../../message-manager'

import { cardName } from '../../command-arguments'
import winston from 'winston'

module.exports = class ImageArtCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'art',
            aliases: ['a', 'art-image'],
            group: 'card',
            memberName: 'art',
            description: 'Displays the artist and full art from the card.',
            examples: [
                'art raza',
                'a secretkeeper'
            ],
            args: [ cardName ]
        })
    }

    async run(msg, args) {
        await MessageManager.deleteArgumentPromptMessages(msg).catch(winston.error)
        if (!msg.channel.typing) { msg.channel.startTyping() }
        let reply, filename
        const card = await Card.findByName(args.cardName)
        if (!card) { reply = `sorry, I couldn't find a card with a name like '${args.cardName}'` }
        else {
            filename = await card.getImage('art').catch(winston.error)
            if (!filename) { reply = `sorry, there was a problem getting the art for ${card.name}` }
        }
        return (reply ?
            msg.reply(reply) :
            msg.say(`**${card.name}**\n**Artist**: ${card.artist}`, { file: { attachment: filename } })
        ).then(m => { if (m.channel.typing) { m.channel.stopTyping() } })
        .catch(winston.error)
    }
}
