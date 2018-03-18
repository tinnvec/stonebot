import { Message, TextChannel } from 'discord.js'
import { Command, CommandMessage, CommandoClient } from 'discord.js-commando'
import * as winston from 'winston'

import Card from '../../models/card'
import CardDataService from '../../services/card-data-service'

export default class ImageCommand extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            aliases: ['img', 'i'],
            args: [{
                key: 'cardName',
                prompt: 'what card are you searching for?\n',
                type: 'string'
            }],
            // @ts-ignore: TypeScript reports clientPermissions as being undefined currently
            clientPermissions: ['ATTACH_FILES'],
            description: 'Displays card image.',
            examples: [
                'image fiery war axe',
                'i brawl'
            ],
            group: 'card',
            memberName: 'image',
            name: 'image'
        })
    }

    public async run(msg: CommandMessage, args: { cardName: string }): Promise<Message | Message[]> {
        let filename: string

        if (!msg.channel.typing) { msg.channel.startTyping() }

        const card: Card = await CardDataService.findOne(args.cardName)
        if (card) { filename = await card.getImageFile() }

        if (msg.channel.typing) { msg.channel.stopTyping() }

        if (!card) { return msg.reply(`sorry, I couldn't find a card with a name like '${args.cardName}'`) }
        if (!filename) { return msg.reply(`sorry, there was a problem getting the image for ${card.name}`) }

        return msg.say('', { file: { attachment: filename } })
    }
}
