import { Command } from 'discord.js-commando'
import Villager from '../../community/villager'

import { bnetId, bnetServer, listAction } from '../../command-arguments'
import winston from 'winston'

const LIST_ACTIONS = ['list', 'add', 'remove']

module.exports = class VillagerCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'villager',
            aliases: ['villagers', 'v', 'bnet', 'b'],
            group: 'community',
            memberName: 'villager',
            description: 'List of community members with battle.net ids.',
            format: '[action] <bnetServer> [bnetId]',
            details: 'You\'ll be are removed from the list if you leave the discord server.\n' +
                'Responses from this command will be removed automatically after 10 minutes.\n' +
                '`[action]` can be one of `list`, `add`, `remove`. Default: `list`.\n' +
                '`<bnetServer>` can be one of `americas|america|na`, `europe|eu`, `asia`.\n' +
                '`[bnetId]` is your battle.net id. Required only for add action.',
            examples: [
                'villager list americas',
                'v na',
                'bnet add europe User#1234',
                'b remove asia'
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
        if (args.listAction === 'add' && !args.bnetId) {
            this.args[2].default = null
            args.bnetId = await this.args[2].obtain(msg).catch(winston.error)
            this.args[2].default = ''
        }
        
        const listName = `Battle.net ${args.bnetServer.capitalizeFirstLetter()}`
        let reply
        let result = await Villager.findOne({ where: {
            guildId: msg.guild.id,
            userId: msg.author.id,
            bnetServer: args.bnetServer
        } }).catch(winston.error)
        switch (args.listAction) {
        case 'add':
            if (result) {
                reply = `already have you on the ${listName} list`
                if (result.bnetId !== args.bnetId) {
                    await Villager.update({
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
                await Villager.create({
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
            return msg.reply(reply).catch(winston.error)
        case 'remove':
            if (!result) {
                reply = `you're not on the ${listName} list.`
            } else {
                await Villager.destroy({ where: {
                    guildId: msg.guild.id,
                    userId: msg.author.id,
                    bnetServer: args.bnetServer
                }}).then(() => { reply = `removed you from the ${listName} list.` })
                .catch(err => {
                    winston.error(err)
                    reply = `sorry, there was an error removing you from the ${listName} list.`
                })
            }
            return msg.reply(reply).catch(winston.error)
        default:
            result = await Villager.findAll({ where: {
                guildId: msg.guild.id,
                bnetServer: args.bnetServer
            } }).catch(winston.error)
            return msg.say(`**${msg.guild.name} - ${listName}**\n` +
                `These folks play games on the Battle.net ${args.bnetServer} server and would love to be your friend!\n\n` +
                (result.length < 1 ? '_No users on this list._' :
                    result.map(v => {
                        let member = msg.guild.members.get(v.userId)
                        if (!member) { return '' }
                        return `**${member.user.username}** - _${v.bnetId}_`
                    }).join('\n'))
            ).catch(winston.error)
        }
    }
}
