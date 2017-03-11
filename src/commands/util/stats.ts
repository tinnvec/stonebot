import { oneLine } from 'common-tags'
import { Guild, Message, RichEmbed, TextChannel } from 'discord.js'
import { Command, CommandMessage, CommandoClient } from 'discord.js-commando'
import * as moment from 'moment'
import winston from 'winston'

export default class StatsCommand extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            description: 'Displays bot statistics.',
            details: 'Only the bot owner(s) may use this command.',
            group: 'util',
            memberName: 'stats',
            name: 'stats'
        })
    }

    public hasPermission(msg: CommandMessage): boolean {
        return this.client.isOwner(msg.author)
    }

    public async run(msg: CommandMessage): Promise<Message | Message[]> {
        if (msg.channel instanceof TextChannel &&
            !msg.channel.permissionsFor(this.client.user).hasPermission('SEND_MESSAGES')) { return }

        const statsDisplay = oneLine`
            Guilds: ${this.client.guilds.size}\n
            Channels: ${this.client.channels.size}\n
            Users: ${this.client.guilds.map((g: Guild) => g.memberCount).reduce((a, b) => a + b)}
        `

        if (msg.channel instanceof TextChannel &&
            !msg.channel.permissionsFor(this.client.user).hasPermission('EMBED_LINKS')) {
            return msg.say(oneLine`
                **${this.client.user.username} Statistics**\n\n
                **Uptime**\n${moment.duration(this.client.uptime).humanize()}\n
                **Memory Usage**\n${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB\n
                **General Stats**\n${statsDisplay}
            `)
        }

        return msg.embed(
            new RichEmbed()
                .setTitle(`${this.client.user.username} Statistics`)
                .setThumbnail(this.client.user.displayAvatarURL)
                .addField('Uptime', moment.duration(this.client.uptime).humanize(), true)
                .addField('Memory Usage', `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`, true)
                .addField('General Stats', statsDisplay, true)
        )
    }
}
