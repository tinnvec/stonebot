import { Message, TextChannel } from 'discord.js'
import { Command, CommandMessage, CommandoClient } from 'discord.js-commando'
import * as winston from 'winston'

import Card from '../../card/card'

class ImageArtCommand extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            aliases: ['a', 'art-image'],
            args: [{
                key: 'cardName',
                prompt: 'what card are you searching for?\n',
                type: 'string'
            }],
            description: 'Displays the artist and full art from the card.',
            examples: [
                'art raza',
                'a secretkeeper'
            ],
            group: 'card',
            memberName: 'art',
            name: 'art'
        })
    }

    public async run(msg: CommandMessage, args: { cardName: string }): Promise<Message | Message[]> {
        if (msg.channel instanceof TextChannel &&
            !msg.channel.permissionsFor(this.client.user).hasPermission('SEND_MESSAGES')) { return }
        if (msg.channel instanceof TextChannel &&
            !msg.channel.permissionsFor(this.client.user).hasPermission('ATTACH_FILES')) {
            return msg.reply('sorry, I don\'t have permission to attach files here, so I can\'t show card art.')
        }

        if (!msg.channel.typing) { msg.channel.startTyping() }
        const card: Card = await Card.findByName(args.cardName)
        if (msg.channel.typing) { msg.channel.stopTyping() }

        if (!card) { return msg.reply(`sorry, I couldn't find a card with a name like '${args.cardName}'`) }

        const filename: string = await card.getImage('art')
        if (!filename) { return msg.reply(`sorry, there was a problem getting the art for ${card.name}`) }

        return msg.say(`**${card.name}**\n**Artist**: ${card.artist}`, { file: { attachment: filename } })
    }
}
