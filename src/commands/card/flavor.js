const Card = require('../../card/card')
const { Command } = require('discord.js-commando')
const Discord = require('discord.js')

const winston = require('winston')

class FlavorCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'flavor',
            aliases: ['f', 'flavor-text'],
            group: 'card',
            memberName: 'flavor',
            description: 'Displays card text and flavor text.',
            examples: [
                'flavor devolve',
                'f small time recruits'
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
        return (card ?
            msg.embed(new Discord.RichEmbed()
        if (msg.channel.type !== 'dm' && !msg.channel.permissionsFor(this.client.user).hasPermission('EMBED_LINKS')) {
            return msg.say(`**${card.name}**\n${card.description}\n**Text**\n${card.text}\n**Flavor**\n${card.flavor}\n${card.url}`).catch(winston.error)
        }
                .setTitle(card.name)
                .setDescription(card.description)
                .setURL(card.url)
                .setColor(card.classColor)
                .addField('Text', card.text)
                .addField('Flavor', card.flavor)) :
            msg.reply(`sorry, I couldn't find a card with a name like '${args.cardName}'`)
        ).then(m => { if (m.channel.typing) { m.channel.stopTyping() } })
        .catch(winston.error)
    }
}

module.exports = FlavorCommand
