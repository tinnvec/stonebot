const Card = require('../../card/card')
const { Command } = require('discord.js-commando')

const winston = require('winston')

class ImageCommand extends Command {
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
            return msg.reply('sorry, I don\'t have permission to attach files here, so I can\'t show card images.').catch(winston.error)
        }

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

module.exports = ImageCommand
