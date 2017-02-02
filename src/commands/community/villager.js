import { Command } from 'discord.js-commando'
import MessageManager from '../../message-manager'
import Villager from '../../community/villager'

import { bnetId, bnetServer, listAction } from '../../command-arguments'
import winston from 'winston'

const LIST_ACTIONS = ['list', 'add', 'remove']
const RESPONSE_DELETE_TIME = 10 * 60 * 1000

module.exports = class VillagerCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'villager',
            aliases: ['villagers', 'bnet'],
            group: 'community',
            memberName: 'villager',
            description: 'List of community members with battle.net ids.',
            format: '[action] <bnetServer> [bnetId]',
            // details: '',
            // examples: [''],
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
        if (args.listAction === 'add' && !args.bnetId) {
            this.args[2].default = null
            args.bnetId = await this.args[2].obtain(msg).catch(winston.error)
            this.args[2].default = ''
        }
        
        await MessageManager.deleteArgumentPromptMessages(msg).catch(winston.error)
        if (!msg.channel.typing) { msg.channel.startTyping() }

        let result, reply
        switch (args.listAction) {
        case 'add':
            result = await Villager.add(msg.guild.id, msg.author.id, args.bnetServer, args.bnetId).catch(winston.error)
            reply = 'sorry, there was an error adding you to the'
            if (result === 'added') { reply = 'added you to the' }
            else if (result === 'updated') { reply = 'updated your entry in the' }
            reply += ` Battle.net ${args.bnetServer.capitalizeFirstLetter()} list on this discord server.`
            break
        case 'remove':
            result = await Villager.remove(msg.guild.id, msg.author.id, args.bnetServer).catch(winston.error)
            reply = 'sorry, there was an error removing you from the'
            if (result === 1) { reply = 'removed you from the' }
            reply += ` Battle.net ${args.bnetServer.capitalizeFirstLetter()} list on this discord server.`
            break
        default:
            result = await Villager.getAll().catch(winston.error)
            result = result.filter(v => { return v.guildId === parseInt(msg.guild.id) && v.bnetServer === args.bnetServer })
            reply = `**${msg.guild.name} - Battle.net ${args.bnetServer.capitalizeFirstLetter()}**\n` +
                `These folks play games on the Battle.net ${args.bnetServer.capitalizeFirstLetter()} server and would love to be your friend!\n\n`
            if (result.length < 1) { reply += '_No users on this list._' }
            result.forEach(villager => {
                let member = msg.guild.members.find(m => parseInt(m.id) === villager.userId)
                if (!member) { return }
                reply += `**${member.user.username}** - _${villager.bnetId}_\n`
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
