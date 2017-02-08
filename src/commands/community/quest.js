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
            let villager = await Villager.findOne({ where: {
                guildId: msg.guild.id,
                userId: msg.author.id,
                bnetServer: args.bnetServer
            } }).catch(winston.error)
            if (villager) {
                args.bnetId = villager.bnetId
            } else if (!args.bnetId) {
                this.args[2].default = null
                args.bnetId = await this.args[2].obtain(msg).catch(winston.error)
                this.args[2].default = ''
            }
        }
        await MessageManager.deleteArgumentPromptMessages(msg)
        
        const listName = `${args.bnetServer.capitalizeFirstLetter()} 80g Quest`
        let reply
        let result = await Quest.findOne({ where: {
            guildId: msg.guild.id,
            userId: msg.author.id,
            bnetServer: args.bnetServer
        } }).catch(winston.error)
        switch (args.listAction) {
        case 'add':
            if (result) {
                reply = `already have you on the ${listName} list`
                if (result.bnetId !== args.bnetId) {
                    await Quest.update({
                        bnetId: args.bnetId
                    }, { where: {
                        guildId: msg.guild.id,
                        userId: msg.author.id,
                        bnetServer: args.bnetServer
                    } }).then(() => { reply += ', updated your entry.' })
                    .catch(err => {
                        winston.error(err)
                        reply += ', but there was an error updating your entry.'
                    })
                } else {
                    reply += '.'
                }
            } else {
                await Quest.create({
                    guildId: msg.guild.id,
                    userId: msg.author.id,
                    bnetServer: args.bnetServer,
                    bnetId: args.bnetId
                }).then(() => { reply = `added you to the ${listName} list.` })
                .catch(err => {
                    winston.error(err)
                    reply = `sorry, there was an error adding you to the ${listName} list.`
                })
            }
            return msg.reply(reply)
                .then(m => { m.delete(RESPONSE_DELETE_TIME) })
                .catch(winston.error)
        case 'remove':
            if (!result) {
                reply = `you're not on the ${listName} list.`
            } else {
                await Quest.destroy({ where: {
                    guildId: msg.guild.id,
                    userId: msg.author.id,
                    bnetServer: args.bnetServer
                }}).then(() => { reply = `removed you from the ${listName} list.` })
                .catch(err => {
                    winston.error(err)
                    reply = `sorry, there was an error removing you from the ${listName} list.`
                })
            }
            return msg.reply(reply)
                .then(m => { m.delete(RESPONSE_DELETE_TIME) })
                .catch(winston.error)
        default:
            result = await Quest.findAll({ where: {
                guildId: msg.guild.id,
                bnetServer: args.bnetServer
            } }).catch(winston.error)
            return msg.say(`**${msg.guild.name} - ${listName}**\n` +
                `These folks have the Hearthstone Play a Friend (aka 80g) quest on the Battle.net ${args.bnetServer.capitalizeFirstLetter()} server.\n` +
                'If you also have the quest, they would would love to trade!\n\n' +
                (result.length < 1 ? '_No users on this list._' :
                    result.map(v => {
                        let member = msg.guild.members.get(v.userId)
                        if (!member) { return '' }
                        return `**${member.user.username}** - _${v.bnetId}_`
                    }).join('\n'))
            ).then(m => { m.delete(RESPONSE_DELETE_TIME) })
            .catch(winston.error)
        }
    }
}
