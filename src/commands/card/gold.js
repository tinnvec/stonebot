const Card = require('../../card/card')
const { Command } = require('discord.js-commando')

const { cardName } = require('../../command-arguments')
const winston = require('winston')

class GoldCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'gold',
            aliases: ['g', 'gold-image'],
            group: 'card',
            memberName: 'gold',
            description: 'Displays golden card image.',
            examples: [
                'gold twisting nether',
                'g dragonfire potion'
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
            filename = await card.getImage('gold').catch(winston.error)
            if (!filename) { reply = `sorry, there was a problem getting the golden image for ${card.name}` }
        }
        return (reply ?
            msg.reply(reply) :
            msg.say('', { file: { attachment: filename } })
        ).then(m => { if (m.channel.typing) { m.channel.stopTyping() } })
        .catch(winston.error)
    }
}

module.exports = GoldCommand
