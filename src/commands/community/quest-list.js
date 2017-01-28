import { Command } from 'discord.js-commando'
import MessageManager from '../../message-manager'
import Quest from '../../community/quest'

import { bnetServer } from '../../command-arguments'
import winston from 'winston'

module.exports = class QuestListCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'quest-list',
            aliases: ['quests', 'quests-list', 'q', '80g-list', '80g', '💰'],
            group: 'community',
            memberName: 'quest-list',
            guildOnly: true,
            description: 'Lists community members with the Hearhtstone Play a Friend (aka 80g) quest.',
            details: '`<bnetServer>` can be one of `americas`, `na`, `europe`, `eu`, `asia`.',
            examples: ['quest-list americas', 'quest-list europe', 'quest-list asia'],
            args: [ bnetServer ]
        })
    }

    async run(msg, args) {
        if (!msg.channel.typing) { msg.channel.startTyping() }
        let quests = await Quest.getAll().catch(winston.error)
        quests = quests.filter(v => { return v.guildId === parseInt(msg.guild.id) && v.bnetServer === args.bnetServer })
        let reply = `**Battle.net - 80g Quest - ${args.bnetServer.capitalizeFirstLetter()}**\n`
        if (quests.length < 1) { reply += '_No users on this list._' }
        quests.forEach(villager => {
            let member = msg.guild.members.find(m => parseInt(m.id) === villager.userId)
            reply += `${member.user.username} - ${villager.bnetId}\n`
        })
        await MessageManager.deleteArgumentPromptMessages(msg)
        return msg.say(reply)
            .then(m => { if (m.channel.typing) { m.channel.stopTyping() } })
            .catch(winston.error)
    }
}
