import { Message, RichEmbed, TextChannel } from 'discord.js'
import { Command, CommandMessage, CommandoClient } from 'discord.js-commando'
import * as winston from 'winston'

import Card from '../../structures/card'
import CardData from '../../structures/card-data'

export default class TextCommand extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            aliases: ['txt', 't', 'card', 'c'],
            args: [
                {
                    key: 'cardName',
                    prompt: 'what card are you searching for?\n',
                    type: 'string'
                }
            ],
            description: 'Displays card text.',
            examples: [
                'text frostbolt',
                't gadgetzan auctioneer',
                'card yshaarj',
                'c tinyfin'
            ],
            group: 'card',
            memberName: 'text',
            name: 'text'
        })
    }

    public async run(msg: CommandMessage, args: { cardName: string }): Promise<Message | Message[]> {
        if (msg.channel instanceof TextChannel &&
            !msg.channel.permissionsFor(this.client.user).hasPermission('SEND_MESSAGES')) { return }

        if (!msg.channel.typing) { msg.channel.startTyping() }
        const card: Card = await CardData.findOne(args.cardName)
        if (msg.channel.typing) { msg.channel.stopTyping() }

        if (!card) { return msg.reply(`sorry, I couldn't find a card with a name like '${args.cardName}'`) }
        if (msg.channel instanceof TextChannel &&
            !msg.channel.permissionsFor(this.client.user).hasPermission('EMBED_LINKS')) {
            return msg.say(`**${card.name}**\n${card.description}\n**Text**\n${card.text}\n${card.url}`)
        }
        return msg.embed(
            new RichEmbed()
                .setTitle(card.name)
                .setDescription(card.description)
                .setURL(card.wikiUrl)
                .setColor(card.classColor)
                .addField('Text', card.text)
        )
    }
}
