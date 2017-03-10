const { Command } = require('discord.js-commando')
const Quest = require('../../community/quest')

const winston = require('winston')

class QuestCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'quest',
            aliases: ['80g'],
            group: 'community',
            memberName: 'quest',
            description: 'Helps find other players looking to trade the Play a Friend (aka 80g) quest.',
            details: 'Makes matches when players share a Discord server and Battle.net server region.\n' +
                '`<bnetServer>` may be one of `americas`, `na`, `europe`, `eu`, `asia`.\n' +
                'Using `!quest complete` will remove you from the pool of those looking to trade.',
            examples: [
                'quest americas',
                '80g eu',
                'quest complete'
            ],
            args: [{
                key: 'bnetServer',
                prompt: 'which battle.net server do you play on?\n',
                type: 'string',
                parse: value => {
                    value = value.toLowerCase()
                    if (value === 'na' || value === 'america') { return 'americas' }
                    if (value === 'eu') { return 'europe'}
                    return value
                },
                validate: value => {
                    value = value.toLowerCase()
                    if (value == 'complete') { return true }
                    if (['americas', 'america', 'na', 'europe', 'eu', 'asia'].includes(value)) { return true }
                    return 'please choose a server from `americas`, `na`, `europe`, `eu`, `asia`.\n' +
                        'You may also say `complete` if you recently finished your quest.\n'
                }
            }]
        })
    }

    async run(msg, args) {
        let result = await Quest
            .findOne({ where: { userId: msg.author.id } })
            .catch(winston.error)
        
        // Are they completing?
        if (args.bnetServer == 'complete') {
            if (result) {
                await Quest
                    .destroy({ where: { userId: msg.author.id } })
                    .catch(winston.error)
                return msg
                    .reply('congratulations! Removed your entry from those looking to trade quests.')
                    .catch(winston.error)
            }
            return msg
                .reply('sorry, don\'t have you as looking to trade quests.')
                .catch(winston.error)
        }
        
        const bnetServerDisplay = `Battle.net ${args.bnetServer.capitalizeFirstLetter()} server`
        // Check if they're on the list
        if (result) {
            if (result.bnetServer == args.bnetServer) {
                return msg
                    .reply(`already have you as looking to trade quests on the ${bnetServerDisplay}.`)
                    .catch(winston.error)
            }
            // Update entry to new server if different
            await Quest
                .update({ bnetServer: args.bnetServer }, { where: { userId: msg.author.id } })
                .catch(winston.error)
            return msg
                .reply(`updated your entry, now have you as looking to trade quests on the ${bnetServerDisplay}.`)
                .catch(winston.error)
        } 

        // Check if another on the list shares a bnet and discord server
        result = await Quest
            .findAll({ where: { bnetServer: args.bnetServer } })
            .catch(winston.error)
        if (result) {
            // Get only quests where users share a guild
            result = result.filter(q => {
                return this.client.guilds.some(g => {
                    return g.members.has(msg.author.id) && g.members.has(q.userId)
                })
            })
            if (result && result.length > 0) {
                const requestor = this.client.users.get(msg.author.id)
                const questHaver = this.client.users.get(result[0].userId)
                await questHaver
                    .send('Hello! I have you on my list of people looking to trade Hearthstone quests. ' +
                        `${requestor} just told me they are also looking to trade on the ${bnetServerDisplay}. ` +
                        'Just contact them and enjoy your gold!\n\n' +
                        'When you\'re all done, just tell me `quest complete`.')
                    .catch(winston.error)
                return msg
                    .reply('looks like someone you share a Discord server with is also looking to trade quests ' +
                        `on the ${bnetServerDisplay}! They should be contacting you soon.`)
                    .catch(winston.error)
            }
        }

        // Add them to the list
        result = await Quest
            .create({ userId: msg.author.id, bnetServer: args.bnetServer })
            .catch(winston.error)
        return msg
            .reply('can\'t find a match for you right now, but will let you know as soon as ' +
                `someone you share a Discord server with is also looking to trade quests on the ${bnetServerDisplay}.`)
            .catch(winston.error)
    }
}

module.exports = QuestCommand
