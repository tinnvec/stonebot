import { Command } from 'discord.js-commando'
import Villager from '../../community/villager'

import { bnetServer } from '../../command-arguments'
import winston from 'winston'

module.exports = class BnetListCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'bnet-list',
            aliases: ['bnet'],
            group: 'community',
            memberName: 'bnet-list',
            guildOnly: true,
            description: 'Lists community member battle.net ids.',
            examples: ['bnet-list americas', 'bnet-list europe', 'bnet-list asia'],
            args: [ bnetServer ]
        })
    }

    async run(msg, args) {
        if (!msg.channel.typing) { msg.channel.startTyping() }
        let villagers = await Villager.getAll().catch(winston.error)
        villagers = villagers.filter(v => { return v.guildId === parseInt(msg.guild.id) && v.bnetServer === args.bnetServer })
        let reply = ''
        villagers.forEach(villager => {
            let member = msg.guild.members.find(m => parseInt(m.id) === villager.userId)
            reply += `${member.user.username} - ${villager.bnetId}\n`
        })
        if (villagers.length < 1) { reply = 'No users on the list.' }
        if (msg.channel.typing) { msg.channel.stopTyping() }
        return msg.say(reply).catch(winston.error)
    }
}
