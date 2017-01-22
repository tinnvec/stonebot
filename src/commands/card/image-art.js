import Card from '../../card/card'
import { Command } from 'discord.js-commando'
import Discord from 'discord.js'

import winston from 'winston'

module.exports = class ImageArtCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'image-art',
            aliases: ['art-image', 'art', 'a', '🖼', '🎨'],
            group: 'card',
            memberName: 'image-art',
            description: 'Displays the artist and full art from the card.',
            examples: ['image-art raza'],
            args: [
                {
                    key: 'name',
                    prompt: 'what card are you searching for?\n',
                    type: 'string'
                }
            ]
        })
    }

    async run(msg, args) {
        if (!msg.channel.typing) { msg.channel.startTyping() }
        const card = await Card.findByName(args.name).catch(winston.error)
        card.getImageUrl('art', imgUrl => {
            if (!imgUrl) {
                if (msg.channel.typing) { msg.channel.stopTyping() }
                return msg.reply(`sorry, I couldn't find the art for ${card.name}`).catch(winston.error)
            }
            const embed = new Discord.RichEmbed()
                .setColor(card.classColor)
                .setTitle(card.name)
                .setImage(imgUrl)
                .addField('Artist', card.artist)
            if (msg.channel.typing) { msg.channel.stopTyping() }
            return msg.embed(embed).catch(winston.error)
        })
    }
}
