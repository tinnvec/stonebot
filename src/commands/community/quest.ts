import { oneLine, stripIndents } from 'common-tags'
import { Message } from 'discord.js'
import { Command, CommandMessage, CommandoClient } from 'discord.js-commando'
import * as winston from 'winston'

// import Quest from '../../database/models/quest'
import CommunityDatabase from '../../services/community-database'

export default class QuestCommand extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            aliases: ['80g'],
            args: [{
                key: 'bnetServer',
                parse: (value: string) => {
                    value = value.toLowerCase()
                    if (value === 'na' || value === 'america') { return 'americas' }
                    if (value === 'eu') { return 'europe'}
                    return value
                },
                prompt: 'which battle.net server do you play on?\n',
                type: 'string',
                validate: (value: string) => {
                    value = value.toLowerCase()
                    if (value === 'complete') { return true }
                    if (['americas', 'america', 'na', 'europe', 'eu', 'asia'].includes(value)) { return true }
                    return stripIndents`
                        please choose a server from \`americas\`, \`na\`, \`europe\`, \`eu\`, \`asia\`.
                        You may also say \`complete\` if you recently finished your quest.
                    `
                }
            }],
            description: 'Helps find other players looking to trade the Play a Friend (aka 80g) quest.',
            details: stripIndents`
                Makes matches when players share a Discord server and Battle.net server region.
                \`<bnetServer>\` may be one of \`americas\`, \`na\`, \`europe\`, \`eu\`, \`asia\`.
                Using \`!quest complete\` will remove you from the pool of those looking to trade.
            `,
            examples: [
                'quest americas',
                '80g eu',
                'quest complete'
            ],
            group: 'community',
            memberName: 'quest',
            name: 'quest'
        })
    }

    public async run(msg: CommandMessage, args: { bnetServer: string }): Promise<Message | Message[]> {
        const result = await CommunityDatabase.getQuestForUser(msg.author.id)

        // Are they completing?
        if (args.bnetServer === 'complete') {
            if (result) {
                return await CommunityDatabase.removeQuestsForUser(msg.author.id)
                    .then(() => msg.reply('congratulations! Removed your entry from those looking to trade quests.'))
            }
            return msg.reply('sorry, don\'t have you as looking to trade quests.')
        }

        const bnetServerDisplay = `Battle.net ${args.bnetServer} server`
        // Check if they're on the list
        if (result) {
            if (result.server === args.bnetServer) {
                return msg.reply(`already have you as looking to trade quests on the ${bnetServerDisplay}.`)
            }
            // Update entry to new server if different
            return await CommunityDatabase.updateQuestsForUser(msg.author.id, args.bnetServer)
                .then(() => msg.reply(
                    `updated your entry, now have you as looking to trade quests on the ${bnetServerDisplay}.`
                ))
        }

        // Check if another on the list shares a bnet and discord server
        let results = await CommunityDatabase.getQuestsForServer(args.bnetServer)
        if (results) {
            // Get only quests where users share a guild
            results = results.filter((q: any) => {
                return this.client.guilds.some((g) => {
                    return g.members.has(msg.author.id) && g.members.has(q.userId)
                })
            })
            if (results && results.length > 0) {
                const requestor = this.client.users.get(msg.author.id)
                const questHaver = this.client.users.get(results[0].user)
                await questHaver.send(oneLine`
                    Hello! I have you on my list of people looking to trade Hearthstone quests.
                    ${requestor} just told me they are also looking to trade on the ${bnetServerDisplay}.
                    Just contact them and enjoy your gold!\n\n
                    When you're all done, just tell me \`quest complete\`.
                `).catch(winston.error)
                return msg.reply(oneLine`
                    looks like someone you share a Discord server with is also looking to trade quests
                    on the ${bnetServerDisplay}! They should be contacting you soon.
                `)
            }
        }

        // Add them to the list
        return await CommunityDatabase.addQuestForUserOnServer(msg.author.id, args.bnetServer)
            .then(() => msg.reply(oneLine`
                can't find a match for you right now, but will let you know as soon as
                someone you share a Discord server with is also looking to trade quests on the ${bnetServerDisplay}.
            `))
    }
}
