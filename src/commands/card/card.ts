import { stripIndents } from 'common-tags'
import { Message, RichEmbed, TextChannel } from 'discord.js'
import { Command, CommandMessage, CommandoClient } from 'discord.js-commando'
import * as winston from 'winston'

import Card from '../../models/card'
import CardDataService from '../../services/card-data-service'

export default class TextCommand extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            aliases: ['c'],
            args: [{
                key: 'cardName',
                prompt: 'what card are you searching for?\n',
                type: 'string'
            }],
            // @ts-ignore: TypeScript reports clientPermissions as being undefined currently
            clientPermissions: ['EMBED_LINKS'],
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
        if (!msg.channel.typing) { msg.channel.startTyping() }

        const card: Card = await CardDataService.findOne(args.cardName)

        if (msg.channel.typing) { msg.channel.stopTyping() }

        if (!card) { return msg.reply(`sorry, I couldn't find a card with a name like '${args.cardName}'`) }

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
