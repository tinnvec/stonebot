const Card = require('../../card/card')
const { Command } = require('discord.js-commando')
const Discord = require('discord.js')

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
        if (msg.channel.type !== 'dm' && !msg.channel.permissionsFor(this.client.user).hasPermission('EMBED_LINKS')) {
            return msg.say(`**${card.name}**\n${card.description}\n**Text**\n${card.text}\n${card.url}`).catch(winston.error)
        }
        return msg.embed(
            new Discord.RichEmbed()
                .setTitle(card.name)
                .setDescription(card.description)
                .setURL(card.url)
                .setColor(card.classColor)
                .addField('Text', card.text)
        ).catch(winston.error)
    }
}

module.exports = TextCommand
