import { stripIndents } from 'common-tags'
import { Message, RichEmbed, TextChannel } from 'discord.js'
import { Command, CommandMessage, CommandoClient } from 'discord.js-commando'
import * as winston from 'winston'

import Card from '../../structures/card'
import CardData from '../../structures/card-data'

export default class TextCommand extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            aliases: ['c'],
            args: [{
                key: 'cardName',
                prompt: 'what card are you searching for?\n',
                type: 'string'
            }],
            description: 'Displays card information.',
            examples: [
                'card tinyfin',
                'c frostbolt'
            ],
            group: 'card',
            memberName: 'card',
            name: 'card'
        })
    }

    public async run(msg: CommandMessage, args: { cardName: string }): Promise<Message | Message[]> {
        if (msg.channel instanceof TextChannel &&
            !msg.channel.permissionsFor(this.client.user).has('SEND_MESSAGES')) {
            return
        }

        if (!msg.channel.typing) { msg.channel.startTyping() }
        const card: Card = await CardData.findOne(args.cardName)
        if (msg.channel.typing) { msg.channel.stopTyping() }

        if (!card) { return msg.reply(`sorry, I couldn't find a card with a name like '${args.cardName}'`) }
        if (msg.channel instanceof TextChannel &&
            !msg.channel.permissionsFor(this.client.user).has('EMBED_LINKS')) {
            return msg.say(stripIndents`
                **${card.name}**
                ${card.description}
                ${card.text}
                **Flavor:** ${card.flavor}
                ${card.wikiUrl}
            `)
        }
        return msg.embed(
            new RichEmbed()
                .setTitle(card.name)
                .setURL(card.wikiUrl)
                .setColor(card.classColor)
                .setDescription(`${card.description}\n${card.text}`)
                .addField('Flavor', card.flavor)
        )
    }
}
