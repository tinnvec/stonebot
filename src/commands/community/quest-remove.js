import { Command } from 'discord.js-commando'
import Quest from '../../community/quest'

import { bnetServer } from '../../command-arguments'
import winston from 'winston'

module.exports = class QuestRemoveCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'quest-remove',
            aliases: ['quests-remove', 'quests-rm', 'quest-rm', 'q-rm', 'qr', '80g-rm', '80gr', '💸'],
            group: 'community',
            memberName: 'quest-remove',
            guildOnly: true,
            description: 'Removes you from the list of community members with the Hearhtstone Play a Friend (aka 80g) quest.',
            details: '`<bnetServer>` can be one of `americas`, `na`, `europe`, `eu`, `asia`.',
            examples: ['quest-remove americas', 'quest-remove europe', 'quest-remove asia'],
            args: [ bnetServer ]
        })
    }

    async run(msg, args) {
        if (!msg.channel.typing) { msg.channel.startTyping() }
        const result = await Quest.remove(msg.guild.id, msg.author.id, args.bnetServer).catch(winston.error)
        let reply = 'I\'ve removed you from the list.'
        if (result !== 1) { reply = 'sorry, there was an error removing you from the list.' }
        if (msg.channel.typing) { msg.channel.stopTyping() }
        return msg.reply(reply).catch(winston.error)
    }
}
