import { Command } from 'discord.js-commando'
import MessageManager from '../../message-manager'
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
            description: 'Removes you from the list of community members with the Hearthstone Play a Friend (aka 80g) quest.',
            details: '`<bnetServer>` can be one of `americas`, `na`, `europe`, `eu`, `asia`.',
            examples: ['quest-remove americas', 'quest-remove europe', 'quest-remove asia'],
            args: [ bnetServer ]
        })
    }

    async run(msg, args) {
        if (!msg.channel.typing) { msg.channel.startTyping() }
        const result = await Quest.remove(msg.guild.id, msg.author.id, args.bnetServer).catch(winston.error)
        let reply = 'removed you from the'
        if (result !== 1) { reply = 'sorry, there was an error removing you from the' }
        reply += ` Battle.net ${args.bnetServer.capitalizeFirstLetter()} 80g Quest list on this discord server.`
        await MessageManager.deleteArgumentPromptMessages(msg)
        return msg.reply(reply)
            .then(m => { if (m.channel.typing) { m.channel.stopTyping() } })
            .catch(winston.error)
    }
}
