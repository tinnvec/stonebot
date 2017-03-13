import { Message, TextChannel } from 'discord.js'
import { Command, CommandMessage, CommandoClient } from 'discord.js-commando'
import * as winston from 'winston'

import Card from '../../structures/card'
import CardData from '../../structures/card-data'

export default class JSONCommand extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            args: [{
                key: 'cardName',
                prompt: 'what card are you searching for?\n',
                type: 'string'
            }],
            description: 'Displays JSON inormation for card.',
            examples: ['json jade golem'],
            group: 'card',
            memberName: 'json',
            name: 'json'
        })
    }

    public async run(msg: CommandMessage, args: { cardName: string }): Promise<Message | Message[]> {
        if (msg.channel instanceof TextChannel &&
            !msg.channel.permissionsFor(this.client.user).hasPermission('SEND_MESSAGES')) {
            return
        }

        if (!msg.channel.typing) { msg.channel.startTyping() }
        const card: Card = await CardData.findOne(args.cardName)
        if (msg.channel.typing) { msg.channel.stopTyping() }

        if (!card) {
            return msg.reply(`sorry, I couldn't find a card with a name like '${args.cardName}'`)
        }

        return msg.code('json', JSON.stringify(card.json, null, '  '))
    }
}
