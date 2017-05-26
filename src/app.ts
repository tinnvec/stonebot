import { oneLine } from 'common-tags'
import { Guild } from 'discord.js'
import { Command, CommandGroup, CommandMessage, CommandoClient, FriendlyError } from 'discord.js-commando'
import * as fs from 'fs'
import * as moment from 'moment'
import * as path from 'path'
import * as winston from 'winston'

import PostgreSQL from './database/postgresql'
import * as SequelizeProvider from './providers/sequelize-provider'
import CommunityManager from './structures/community-manager'

// Create data folder structure
['logs', 'sounds', 'images', 'images/art', 'images/gold'].forEach((folder: string) => {
    const fpath = `/data/${folder}`
    if (!fs.existsSync(fpath)) { fs.mkdirSync(fpath) }
})

// Read config
// tslint:disable-next-line:no-var-requires
const config: Config = require('/data/config.json')

// Set winston config
winston.configure({
    transports: [
        // Console logging
        new (winston.transports.Console)({
            level: config.logLevel,
            prettyPrint: true
        }),
        // Rotated file logging
        new (winston.transports.File)({
            filename: '/data/logs/debug.log',
            json: false,
            level: 'debug',
            maxFiles: 5,
            maxSize: 1000000,
            prettyPrint: true,
            tailable: true,
            timestamp: () => moment().format('YYYY-MM-DD HH:mm:ss.SSS')
        })
    ]
})

// Instantiate commando client
const client: CommandoClient = new CommandoClient({
    commandPrefix: config.prefix,
    owner: config.owner
})

// Start db connection
PostgreSQL.start()
// Use db as client settings provider
client.setProvider(new SequelizeProvider(PostgreSQL.db)).catch(winston.error)

// Listen to client events
client.on('debug', winston.debug)
    .on('warn', winston.warn)
    .on('error', winston.error)
    .on('disconnect', (event: any) => {
        winston.warn(`Disconnected [${event.code}]: ${event.reason || 'Unknown reason'}.`)
    })
    .on('reconnecting', () => {
        winston.info('Reconnecting...')
    })
    .on('guildCreate', (guild: Guild) => {
        winston.verbose(`Joined guild ${guild.name}.`)
    })
    .on('guildDelete', (guild: Guild) => {
        winston.verbose(`Departed guild ${guild.name}.`)
    })
    .on('commandBlocked', (msg: CommandMessage, reason: string) => {
        winston.verbose(oneLine`
            Command ${msg.command ? `${msg.command.groupID}:${msg.command.memberName}` : ''} blocked.
            User: ${msg.author.username}#${msg.author.discriminator}. Reason: ${reason}.
        `)
    })
    .on('commandError', (command: Command, error: {}) => {
        if (error instanceof FriendlyError) { return }
        winston.error(`Error in command ${command.groupID}:${command.memberName}`, error)
    })
    .on('commandPrefixChange', (guild: Guild, prefix: string) => {
        winston.verbose(oneLine`
            Prefix changed to ${prefix || 'the default'}
            ${guild ? `in guild ${guild.name}` : 'globally'}.
        `)
    })
    .on('commandRun', (command: Command, promise: Promise<any>, msg: CommandMessage, args: string | {} | string[]) => {
        winston.verbose(oneLine`
            Command ${command.groupID}:${command.memberName}
            run by ${msg.author.username}#${msg.author.discriminator}
            in ${msg.guild ? `${msg.guild.name}` : 'DM'}.
            ${Object.values(args)[0] ? ` Arguments: ${Object.values(args)}.` : ''}
        `)
    })
    .on('commandStatusChange', (guild: Guild, command: Command, enabled: boolean) => {
        winston.verbose(oneLine`
            Command ${command.groupID}:${command.memberName}
            ${enabled ? 'enabled' : 'disabled'}
            ${guild ? `in guild ${guild.name}` : 'globally'}.
        `)
    })
    .on('groupStatusChange', (guild: Guild, group: CommandGroup, enabled: boolean) => {
        winston.verbose(oneLine`
            Group ${group.id} ${enabled ? 'enabled' : 'disabled'}
            ${guild ? `in guild ${guild.name}` : 'globally'}.
        `)
    })
    .on('ready', () => {
        CommunityManager.start()
        client.user.setGame('Hearthstone')
        winston.info(`Client ready. Currently in ${client.guilds.size} guilds.`)
    })

// Register types, groups and commands with client
client.registry
    .registerDefaultTypes()
    .registerGroups([
        ['card', 'Card Information'],
        ['community', 'Community']
    ])
    .registerDefaultGroups()
    .registerCommandsIn(path.join(__dirname, 'commands'))
    .registerDefaultCommands({ eval_: false })

// Connect to Discord
client.login(config.token)
