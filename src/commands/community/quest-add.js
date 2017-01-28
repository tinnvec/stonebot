import { Command } from 'discord.js-commando'
import MessageManager from '../../message-manager'
import Quest from '../../community/quest'
import Villager from '../../community/villager'

import { bnetId, bnetServer } from '../../command-arguments'
import winston from 'winston'

module.exports = class QuestAddCommand extends Command {
    constructor(client) {
        let bnetIdWithDefault = { default: '' }
        Object.assign(bnetIdWithDefault, bnetId)
        super(client, {
            name: 'quest-add',
            aliases: ['quests-add', 'q-add', 'qa', '80g-add', '80ga', '🤑'],
            group: 'community',
            memberName: 'quest-add',
            guildOnly: true,
            description: 'Adds you to the list of community members with the Hearthstone Play a Friend (aka 80g) quest.',
            details: '`<bnetServer>` can be one of `americas`, `na`, `europe`, `eu`, `asia`\n`<bnetId>` is your battle.net id. This is optional if you are already on the `villager-list` for `<bnetServer>',
            examples: ['quest-add americas user#1234', 'quest-add europe user#1234', 'quest-add asia user#1234'],
            args: [ bnetServer, bnetIdWithDefault ]
        })
    }

    async run(msg, args) {
        const villager = await Villager.find(msg.guild.id, msg.author.id, args.bnetServer).catch(winston.error)
        if (villager) {
            args.bnetId = villager.bnetId
        } else if (!args.bnetId) {
            this.args[1].default = null
            args.bnetId = await this.args[1].obtain(msg).catch(winston.error)
            this.args[1].default = ''
        }
        let result = await Quest.add(msg.guild.id, msg.author.id, args.bnetServer, args.bnetId).catch(winston.error)
        if (!result || typeof result !== 'string') { result = 'sorry, there was an error adding you to the list.' }
        if (!msg.channel.typing) { msg.channel.startTyping() }
        await MessageManager.deleteArgumentPromptMessages(msg)
        return msg.reply(result)
            .then(m => { if (m.channel.typing) { m.channel.stopTyping() } })
            .catch(winston.error)
    }
}
