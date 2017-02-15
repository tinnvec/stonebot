const Card = require('../../card/card')
const { Command } = require('discord.js-commando')

const { cardName } = require('../../command-arguments')
const winston = require('winston')

class ImageArtCommand extends Command {
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
        if (!msg.channel.typing) { msg.channel.startTyping() }
        let reply, filename
        const card = await Card.findByName(args.cardName).catch(winston.error)
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

module.exports = ImageArtCommand
