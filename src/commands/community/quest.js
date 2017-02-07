import { Command } from 'discord.js-commando'
import MessageManager from '../../message-manager'
import Quest from '../../community/quest'
import Villager from '../../community/villager'

import { bnetId, bnetServer, listAction } from '../../command-arguments'
import winston from 'winston'

const LIST_ACTIONS = ['list', 'add', 'remove']
const RESPONSE_DELETE_TIME = 10 * 60 * 1000

module.exports = class QuestCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'quest',
            aliases: ['quests', 'q', '80g'],
            group: 'community',
            memberName: 'quest',
            description: 'List of community members with the Hearthstone Play a Friend (aka 80g) quest.',
            format: '[action] <bnetServer> [bnetId]',
            details: 'Quests are removed (expire) after 24 hours or if you leave the discord server.\n' +
                'Responses from this command will be removed automatically after 10 minutes.\n' +
                '`[action]` can be one of `list`, `add`, `remove`. Default: `list`.\n' +
                '`<bnetServer>` can be one of `americas|america|na`, `europe|eu`, `asia`.\n' +
                '`[bnetId]` is your battle.net id. Required only for add action, optional if you are on the villagers list.',
            examples: [
                'quest list americas',
                'q na',
                '80g add europe User#1234',
                'q remove asia'
            ],
            guildOnly: true,
            args: [ listAction, bnetServer, bnetId ]
            // argsPromptLimit: 0
        })
    }

    async run(msg, args) {
        if (!LIST_ACTIONS.includes(args.listAction)) {
            args.bnetId = this.args[2].parse(args.bnetServer, msg)
            args.bnetServer = this.args[1].parse(args.listAction, msg)
            args.listAction = 'list'
        }
        if (!args.bnetServer) {
            this.args[1].default = null
            args.bnetServer = await this.args[1].obtain(msg).catch(winston.error)
            this.args[1].default = ''
        }
        if (args.listAction === 'add') {
            let villager = await Villager.find(msg.guild.id, msg.author.id, args.bnetServer).catch(winston.error)
            if (villager) {
                args.bnetId = villager.bnetId
            } else if (!args.bnetId) {
                this.args[2].default = null
                args.bnetId = await this.args[2].obtain(msg).catch(winston.error)
                this.args[2].default = ''
            }
        }
        
        await MessageManager.deleteArgumentPromptMessages(msg)
        if (!msg.channel.typing) { msg.channel.startTyping() }

        let result, reply
        switch (args.listAction) {
        case 'add':
            result = await Quest.add(msg.guild.id, msg.author.id, args.bnetServer, args.bnetId).catch(winston.error)
            reply = 'sorry, there was an error adding you to the'
            if (result === 'added') { reply = 'added you to the' }
            else if (result === 'updated') { reply = 'updated your entry in the' }
            reply += ` Battle.net ${args.bnetServer.capitalizeFirstLetter()} 80g Quest list on this discord server.`
            break
        case 'remove':
            result = await Quest.remove(msg.guild.id, msg.author.id, args.bnetServer).catch(winston.error)
            reply = 'sorry, there was an error removing you from the'
            if (result === 1) { reply = 'removed you from the' }
            reply += ` Battle.net ${args.bnetServer.capitalizeFirstLetter()} 80g Quest list on this discord server.`
            break
        default:
            result = await Quest.getAll().catch(winston.error)
            result = result.filter(q => { return q.guildId === parseInt(msg.guild.id) && q.bnetServer === args.bnetServer })
            reply = `**${msg.guild.name} - Battle.net ${args.bnetServer.capitalizeFirstLetter()} - 80g Quest**\n` +
                `These folks have the Hearthstone Play a Friend (aka 80g) quest on the Battle.net ${args.bnetServer.capitalizeFirstLetter()} server.\n` +
                'If you also have the quest, they would would love to trade!\n\n'
            if (result.length < 1) { reply += '_No users on this list._' }
            result.forEach(quest => {
                let member = msg.guild.members.find(m => parseInt(m.id) === quest.userId)
                if (!member) { return }
                reply += `**${member.user.username}** - _${quest.bnetId}_\n`
            })
            return msg.say(reply)
            .then(m => {
                if (m.channel.typing) { m.channel.stopTyping() }
                m.delete(RESPONSE_DELETE_TIME)
            }).catch(winston.error)
        }
        
        return msg.reply(reply)
        .then(m => {
            if (m.channel.typing) { m.channel.stopTyping() }
            m.delete(RESPONSE_DELETE_TIME)
        }).catch(winston.error)
    }
}
