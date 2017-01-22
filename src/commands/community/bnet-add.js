import { Command } from 'discord.js-commando'
import Villager from '../../community/villager'

import winston from 'winston'

module.exports = class BnetAddCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'bnet-add',
            // aliases: ['bnet'],
            group: 'community',
            memberName: 'bnet-add',
            guildOnly: true,
            description: 'Adds your battle.net id to the community list.',
            examples: ['bnet-add americas user#1234', 'bnet-add europe user#1234', 'bnet-add asia user#1234'],
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
                },
                {
                    key: 'bnetid',
                    prompt: 'what is your battle.net id?\n',
                    type: 'string'
                }
            ]
        })
    }

    async run(msg, args) {
        if (!msg.channel.typing) { msg.channel.startTyping() }
        let result = await Villager.add(msg.guild.id, msg.author.id, args.server, args.bnetid)
        if (!result || typeof result !== 'string') { result = 'sorry, there was an error adding you to the list.' }
        if (msg.channel.typing) { msg.channel.stopTyping() }
        return msg.reply(result).catch(winston.error)
    }
}
