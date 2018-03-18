import { stripIndents } from 'common-tags'
import { Message, RichEmbed, TextChannel } from 'discord.js'
import { Command, CommandMessage, CommandoClient } from 'discord.js-commando'
import * as path from 'path'
import * as winston from 'winston'

import Card from '../../models/card'
import CardData from '../../services/card-data'

export default class ImageArtCommand extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            aliases: ['a', 'art-image'],
            args: [{
                key: 'cardName',
                prompt: 'what card are you searching for?\n',
                type: 'string'
            }],
            // @ts-ignore: TypeScript reports clientPermissions as being undefined currently
            clientPermissions: ['ATTACH_FILES', 'EMBED_LINKS'],
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
        let filename: string

        if (!msg.channel.typing) { msg.channel.startTyping() }

        const card: Card = await CardData.findOne(args.cardName)
        if (card) { filename = await card.getImageFile('art') }

        if (msg.channel.typing) { msg.channel.stopTyping() }

        if (!card) { return msg.reply(`sorry, I couldn't find a card with a name like '${args.cardName}'`) }
        if (!filename) { return msg.reply(`sorry, there was a problem getting the art for ${card.name}`) }

        const cleanFilename = path.basename(filename).replace('_', '')

        return msg.embed(
            new RichEmbed()
                .setTitle(card.name)
                .setURL(card.wikiUrl)
                .setColor(card.classColor)
                .addField('Artist', card.artist)
                .attachFile({ attachment: filename, name: cleanFilename })
                .setImage(`attachment://${cleanFilename}`)
        )
    }
}
