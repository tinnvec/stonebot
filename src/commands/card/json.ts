import { Message, TextChannel } from 'discord.js'
import { Command, CommandMessage, CommandoClient } from 'discord.js-commando'
import * as winston from 'winston'

import Card from '../../models/card'
import CardDataService from '../../services/card-data-service'

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
        if (!msg.channel.typing) { msg.channel.startTyping() }

        const card: Card = await CardDataService.findOne(args.cardName)

        if (msg.channel.typing) { msg.channel.stopTyping() }

        if (!card) { return msg.reply(`sorry, I couldn't find a card with a name like '${args.cardName}'`) }

        return msg.code('json', JSON.stringify(card.json, undefined, '  '))
    }
}
