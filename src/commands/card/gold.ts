import { oneLine } from 'common-tags'
import { Message, TextChannel } from 'discord.js'
import { Command, CommandMessage, CommandoClient } from 'discord.js-commando'
import * as winston from 'winston'

import Card from '../../structures/card'
import CardData from '../../structures/card-data'

export default class GoldCommand extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            aliases: ['g', 'gold-image'],
            args: [{
                key: 'cardName',
                prompt: 'what card are you searching for?\n',
                type: 'string'
            }],
            description: 'Displays golden card image.',
            examples: [
                'gold twisting nether',
                'g dragonfire potion'
            ],
            group: 'card',
            memberName: 'gold',
            name: 'gold'
        })
    }

    public async run(msg: CommandMessage, args: { cardName: string }): Promise<Message | Message[]> {
        if (msg.channel instanceof TextChannel &&
            !msg.channel.permissionsFor(this.client.user).hasPermission('SEND_MESSAGES')) {
            return
        }

        if (msg.channel instanceof TextChannel &&
            !msg.channel.permissionsFor(this.client.user).hasPermission('ATTACH_FILES')) {
            return msg.reply(oneLine`
                sorry, I don't have permission to attach files here, so I can't show golden card images.
            `)
        }

        if (!msg.channel.typing) { msg.channel.startTyping() }
        const card: Card = await CardData.findOne(args.cardName)
        let filename: string
        if (card) { filename = await card.getImageFile('gold') }
        if (msg.channel.typing) { msg.channel.stopTyping() }

        if (!card) {
            return msg.reply(`sorry, I couldn't find a card with a name like '${args.cardName}'`)
        }

        if (!filename) {
            return msg.reply(`sorry, there was a problem getting the golden image for ${card.name}`)
        }

        return msg.say('', { file: { attachment: filename } })
    }
}
