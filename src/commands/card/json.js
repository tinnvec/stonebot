const Card = require('../../card/card')
const { Command } = require('discord.js-commando')

const { cardName } = require('../../command-arguments')
const winston = require('winston')

class JSONCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'json',
            group: 'card',
            memberName: 'json',
            description: 'Displays JSON inormation for card.',
            examples: ['json jade golem'],
            args: [ cardName ]
        })
    }

    async run(msg, args) {
        if (!msg.channel.typing) { msg.channel.startTyping() }
        const card = await Card.findByName(args.cardName).catch(winston.error)
        return (card ?
            msg.code('json', JSON.stringify(card.json, null, '  ')) :
            msg.reply(`sorry, I couldn't find a card with a name like '${args.cardName}'`)
        ).then(m => { if (m.channel.typing) { m.channel.stopTyping() } })
        .catch(winston.error)
    }
}

module.exports = JSONCommand
