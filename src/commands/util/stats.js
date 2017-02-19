const { Command } = require('discord.js-commando')
const Discord = require('discord.js')

const moment = require('moment')
const winston = require('winston')

class StatsCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'stats',
            group: 'util',
            memberName: 'stats',
            description: 'Displays bot statistics.',
            details: 'Only the bot owner(s) may use this command.'
        })
    }

    hasPermission(msg) {
        return this.client.isOwner(msg.author)
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

module.exports = StatsCommand
