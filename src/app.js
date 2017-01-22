import Commando from 'discord.js-commando'
import Community from './community/community'

import path from 'path'
import sqlite from 'sqlite'
import winston from 'winston'

import config from './config.json'

winston.remove(winston.transports.Console)
winston.add(winston.transports.Console, { level: config.logLevel })

const client = new Commando.Client({
    owner: config.owner,
    commandPrefix: config.prefix
})

client.on('debug', winston.debug)
client.on('warn', winston.warn)
client.on('error', winston.error)

client.on('guildCreate', guild => { winston.info(`Joined Guild: ${guild.name}.`) })
client.on('guildDelete', guild => { winston.info(`Departed Guild: ${guild.name}.`) })

client.on('disconnect', event => { winston.warn(`Disconnected [${event.code}]: ${event.reason || 'Unknown reason'}`)} )
client.on('reconnecting', () => { winston.verbose('Reconnecting...')})


client.on('ready', async () => {
    await Community.init().catch(winston.error)
    winston.info('Client Ready.')
    winston.verbose(`Current Guilds (${client.guilds.size}): ${client.guilds.map(guild => { return guild.name }).join('; ')}.`)
    client.user.setGame('Hearthstone')
})

client.setProvider(
    sqlite.open('/data/settings.sqlite3')
        .then(db => new Commando.SQLiteProvider(db))
).catch(winston.error)

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
