import { Command } from 'discord.js-commando'
import MessageManager from '../../message-manager'
import Villager from '../../community/villager'

import { bnetServer } from '../../command-arguments'
import winston from 'winston'

module.exports = class VillagerListCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'villager-list',
            aliases: ['villagers', 'v', 'bnet-list', 'bnet', 'b', '🏠'],
            group: 'community',
            memberName: 'villager-list',
            guildOnly: true,
            description: 'Lists community member battle.net ids.',
            details: '`<bnetServer>` can be one of `americas`, `na`, `europe`, `eu`, `asia`.',
            examples: ['villager-list americas', 'villager-list europe', 'villager-list asia'],
            args: [ bnetServer ]
        })
    }

    async run(msg, args) {
        if (!msg.channel.typing) { msg.channel.startTyping() }
        let villagers = await Villager.getAll().catch(winston.error)
        villagers = villagers.filter(v => { return v.guildId === parseInt(msg.guild.id) && v.bnetServer === args.bnetServer })
        let reply = `**Battle.net - ${args.bnetServer.capitalizeFirstLetter()}**\n`
        if (villagers.length < 1) { reply += '_No users on this list._' }
        villagers.forEach(villager => {
            let member = msg.guild.members.find(m => parseInt(m.id) === villager.userId)
            reply += `${member.user.username} - ${villager.bnetId}\n`
        })
        if (msg.channel.typing) { msg.channel.stopTyping() }
        return msg.say(reply).catch(winston.error)
        await MessageManager.deleteArgumentPromptMessages(msg)
    }
}
