const Card = require('../../card/card')
const { Command } = require('discord.js-commando')

const winston = require('winston')

class JSONCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'json',
            group: 'card',
            memberName: 'json',
            description: 'Displays JSON inormation for card.',
            examples: ['json jade golem'],
            args: [
                {
                    key: 'cardName',
                    prompt: 'what card are you searching for?\n',
                    type: 'string'
                }
            ]
        })
    }

    async run(msg, args) {
        if (msg.channel.type !== 'dm' && !msg.channel.permissionsFor(this.client.user).hasPermission('SEND_MESSAGES')) { return }

        if (!msg.channel.typing) { msg.channel.startTyping() }
        const card = await Card.findByName(args.cardName).catch(winston.error)
        if (msg.channel.typing) { msg.channel.stopTyping() }

        if (!card) { return msg.reply(`sorry, I couldn't find a card with a name like '${args.cardName}'`).catch(winston.error) }
        return msg.code('json', JSON.stringify(card.json, null, '  ')).catch(winston.error)
    }
}

module.exports = JSONCommand
