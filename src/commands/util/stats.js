import { Command } from 'discord.js-commando'
import Discord from 'discord.js'

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
        const statsDisplay = `Guilds: ${this.client.guilds.size}\n` +
            `Channels: ${this.client.channels.size}\n` +
            `Users: ${this.client.guilds.map(g => g.memberCount).reduce((a, b) => a + b)}`
        return msg.embed(new Discord.RichEmbed()
            .setTitle(`${this.client.user.username} Statistics`)
            .setThumbnail(this.client.user.displayAvatarURL)
            .addField('Uptime', moment.duration(this.client.uptime).humanize(), true)
            .addField('Memory Usage', `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`, true)
            .addField('General Stats', statsDisplay,true)
        ).catch(winston.error)
    }
}
