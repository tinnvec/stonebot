import { Command } from 'discord.js-commando'

import moment from 'moment'
import winston from 'winston'

module.exports = class StatsCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'stats',
            group: 'util',
            memberName: 'stats',
            description: 'Displays bot statistics. Bot owner only.',
            guildOnly: true
        })
    }

    hasPermission(msg) {
        return this.client.options.owner === msg.author.id
    }

    async run(msg) {
        return msg.embed({
            title: `${this.client.user.username} Statistics`,
            thumbnail: { url: this.client.user.displayAvatarURL },
            fields: [
                {
                    name: 'Uptime',
                    value: moment.duration(this.client.uptime).humanize(),
                    inline: true
                },
                {
                    name: 'Memory Usage',
                    value: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
                    inline: true
                },
                {
                    name: 'General Stats',
                    value: `Guilds: ${this.client.guilds.size}\n` +
                        `Channels: ${this.client.channels.size}\n` +
                        `Users: ${this.client.guilds.map(g => g.memberCount).reduce((a, b) => a + b)}`,
                    inline: true
                }
            ]
        }).catch(winston.error)
    }
}
