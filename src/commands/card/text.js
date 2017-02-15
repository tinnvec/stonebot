const Card = require('../../card/card')
const { Command } = require('discord.js-commando')
const Discord = require('discord.js')

const { cardName } = require('../../command-arguments')
const winston = require('winston')

class TextCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'text',
            aliases: ['txt', 't', 'card', 'c'],
            group: 'card',
            memberName: 'text',
            description: 'Displays card text.',
            examples: [
                'text frostbolt',
                't gadgetzan auctioneer',
                'card yshaarj',
                'c tinyfin'
            ],
            args: [ cardName ]
        })
    }

    async run(msg, args) {
        if (!msg.channel.typing) { msg.channel.startTyping() }
        const card = await Card.findByName(args.cardName).catch(winston.error)
        return (card ?
            msg.embed(new Discord.RichEmbed()
                .setTitle(card.name)
                .setDescription(card.description)
                .setURL(card.url)
                .setColor(card.classColor)
                .addField('Text', card.text)) :
            msg.reply(`sorry, I couldn't find a card with a name like '${args.cardName}'`)
        ).then(m => { if (m.channel.typing) { m.channel.stopTyping() } })
        .catch(winston.error)
    }
}

module.exports = TextCommand
