const Card = require('../../card/card')
const { Command } = require('discord.js-commando')

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
        if (msg.channel.type !== 'dm' && !msg.channel.permissionsFor(this.client.user).hasPermission('ATTACH_FILES')) {
            return msg.reply('sorry, I don\'t have permission to attach files here, so I can\'t show golden card images.').catch(winston.error)
        }

        if (!msg.channel.typing) { msg.channel.startTyping() }
        const card = await Card.findByName(args.cardName).catch(winston.error)
        if (msg.channel.typing) { msg.channel.stopTyping() }

        if (!card) { return msg.reply(`sorry, I couldn't find a card with a name like '${args.cardName}'`).catch(winston.error) }
        
        const filename = await card.getImage('gold').catch(winston.error)
        if (!filename) { return msg.reply(`sorry, there was a problem getting the golden image for ${card.name}`).catch(winston.error) }
        
        return msg.say('', { file: { attachment: filename } }).catch(winston.error)
    }
}

module.exports = GoldCommand
