import Commando from 'discord.js-commando'
import path from 'path'
import sqlite from 'sqlite'
import config from './config.json'

const client = new Commando.Client({
    owner: config.owner,
    commandPrefix: config.prefix
})

if (config.logLevel > 1) {
    client.on('debug', console.info)
    client.on('guildCreate', guild => { console.info(`Joined Guild: ${guild.name}.`) })
    client.on('guildDelete', guild => { console.info(`Left Guild: ${guild.name}.`) })
}
if (config.logLevel > 0) {
    client.on('warn', console.warn)
    client.on('disconnect', event => { console.warn(`Disconnected[${event.code}]: ${event.reason}`)} )
    client.on('reconnecting', () => { console.warn('Reconnecting...')})
}
client.on('error', console.error)

client.on('ready', () => {
    if (config.logLevel > 1) {
        console.info('Client Ready.')
        console.info(`Current Guilds(${client.guilds.size}): ${client.guilds.map(guild => { return guild.name }).join('; ')}.`)
    }
    client.user.setGame('Hearthstone')
})

client.setProvider(
    sqlite.open('/data/settings.sqlite3')
        .then(db => new Commando.SQLiteProvider(db))
).catch(console.error)

client.registry
    .registerDefaultTypes()
    .registerGroups([
        ['card', 'Card Information']
    ])
    .registerDefaultGroups()
    .registerCommandsIn(path.join(__dirname, 'commands'))
    .registerDefaultCommands({ eval_: false, commandState: false })

client.login(config.token)
