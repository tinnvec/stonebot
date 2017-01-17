import Discord from 'discord.js'
import { Command } from 'discord.js-commando'
import Card from '../../card/card'

module.exports = class ImageArtCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'image-art',
            aliases: ['art-image', 'art', 'a', '🖼', '🎨'],
            group: 'card',
            memberName: 'image-art',
            description: 'Displays the artist and full art from the card.',
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
        const card = await Card.findByName(args.name).catch(console.error)
        const embed = new Discord.RichEmbed()
            .setColor(card.getClassColor())
            .setTitle(card.name)
            .setImage(card.getImageUrl('art'))
        if (card.artist) { embed.addField('Artist', card.artist) }
        if (msg.channel.typing) { msg.channel.stopTyping() }
        return msg.embed(embed)
    }
}
