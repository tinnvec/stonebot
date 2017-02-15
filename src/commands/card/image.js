import Card from '../../card/card'
import { Command } from 'discord.js-commando'

import { cardName } from '../../command-arguments'
import winston from 'winston'

module.exports = class ImageCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'image',
            aliases: ['img', 'i'],
            group: 'card',
            memberName: 'image',
            description: 'Displays card image.',
            examples: [
                'image fiery war axe',
                'i brawl'
            ],
            args: [ cardName ]
        })
    }

    async run(msg, args) {
        if (!msg.channel.typing) { msg.channel.startTyping() }
        let reply, filename
        const card = await Card.findByName(args.cardName).catch(winston.error)
        if (!card) { reply = `sorry, I couldn't find a card with a name like '${args.cardName}'` }
        else {
            filename = await card.getImage().catch(winston.error)
            if (!filename) { reply = `sorry, there was a problem getting the image for ${card.name}` }
        }
        return (reply ?
            msg.reply(reply) :
            msg.say('', { file: { attachment: filename } })
        ).then(m => { if (m.channel.typing) { m.channel.stopTyping() } })
        .catch(winston.error)
    }
}
