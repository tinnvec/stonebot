import Commando from 'discord.js-commando'
import CommunityManager from './community/community-manager'
import PostgreSQL from './postgresql/postgresql'
import SequelizeProvider from './postgresql/sequelize-provider'

import path from 'path'
import winston from 'winston'

import config from '/data/config.json'

String.prototype.capitalizeFirstLetter = function() { return this.charAt(0).toUpperCase() + this.slice(1) }

winston.remove(winston.transports.Console)
winston.add(winston.transports.Console, { level: config.logLevel })

const postgresql = new PostgreSQL(config.database)
postgresql.init()

const client = new Commando.Client({ owner: config.owner, commandPrefix: config.prefix })
const communityManager = new CommunityManager(client)

client
    .on('debug', winston.debug)
    .on('warn', winston.warn)
    .on('error', winston.error)
    .on('disconnect', event => { winston.warn(`Disconnected [${event.code}]: ${event.reason || 'Unknown reason'}`) })
    .on('reconnecting', () => { winston.info('Reconnecting...') })
    .on('guildCreate', guild => { winston.verbose(`Joined Guild: ${guild.name}.`) })
    .on('guildDelete', guild => {
        winston.verbose(`Departed Guild: ${guild.name}.`)
        communityManager.handleGuildDepart(guild.id)
    })
    .on('guildMemberRemove', guildMember => { communityManager.handleMemberDepart(guildMember.guild.id, guildMember.id) })
    .on('ready', async () => {
        communityManager.start()
        winston.info('Client Ready.')
        winston.verbose(`Current Guilds (${client.guilds.size}): ${client.guilds.map(guild => { return guild.name }).join('; ')}.`)
        client.user.setGame('Hearthstone')
    })

client.setProvider(new SequelizeProvider(postgresql.db)).catch(winston.error)

client.registry
    .registerDefaultTypes()
    .registerGroups([
        ['card', 'Card Information'],
        ['community', 'Community']
    ])
    .registerDefaultGroups()
    .registerCommandsIn(path.join(__dirname, 'commands'))
    .registerDefaultCommands({ eval_: false, commandState: false })

client.login(config.token)
