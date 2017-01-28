import { Command } from 'discord.js-commando'
import MessageManager from '../../message-manager'
import Villager from '../../community/villager'

import { bnetServer } from '../../command-arguments'
import winston from 'winston'

module.exports = class VillagerRemoveCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'villager-remove',
            aliases: [
                'villager-rm', 'villagers-remove', 'villagers-rm', 'v-remove', 'v-rm', 'vr',
                'bnet-remove', 'bnet-rm', 'b-remove', 'b-rm', 'br', '🏚'
            ],
            group: 'community',
            memberName: 'villager-remove',
            guildOnly: true,
            description: 'Removes your battle.net id from the community list.',
            details: '`<bnetServer>` can be one of `americas`, `na`, `europe`, `eu`, `asia`.',
            examples: ['villager-remove americas', 'villager-remove europe', 'villager-remove asia'],
            args: [ bnetServer ]
        })
    }

    async run(msg, args) {
        if (!msg.channel.typing) { msg.channel.startTyping() }
        const result = await Villager.remove(msg.guild.id, msg.author.id, args.bnetServer).catch(winston.error)
        let reply = 'I\'ve removed you from the list.'
        if (result !== 1) { reply = 'sorry, there was an error removing you from the list.' }
        await MessageManager.deleteArgumentPromptMessages(msg)
        return msg.reply(reply)
            .then(m => { if (m.channel.typing) { m.channel.stopTyping() } })
            .catch(winston.error)
    }
}
