import { Command } from 'discord.js-commando'
import Villager from '../../community/villager'

import winston from 'winston'

module.exports = class BnetRemoveCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'bnet-remove',
            aliases: ['bnet-rm'],
            group: 'community',
            memberName: 'bnet-remove',
            guildOnly: true,
            description: 'Removes your battle.net id from the community list.',
            examples: ['bnet-remove americas', 'bnet-remove europe', 'bnet-remove asia'],
            args: [
                {
                    key: 'server',
                    prompt: 'which battle.net server do you play on?\n',
                    type: 'string',
                    parse: value => { return value.toLowerCase() },
                    validate: value => {
                        if (['americas', 'europe', 'asia'].includes(value.toLowerCase())) { return true }
                        return 'please choose a server from `americas`, `europe`, `asia`.\n'
                    }
                }
            ]
        })
    }

    async run(msg, args) {
        if (!msg.channel.typing) { msg.channel.startTyping() }
        const result = await Villager.remove(msg.guild.id, msg.author.id, args.server).catch(winston.error)
        let reply = 'I\'ve removed you from the list.'
        if (result !== 1) { reply = 'sorry, there was an error removing you from the list.' }
        if (msg.channel.typing) { msg.channel.stopTyping() }
        return msg.reply(reply).catch(winston.error)
    }
}
