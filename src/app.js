import Discord from 'discord.js'

import messageHandler from './handlers/message-handler'
import config from './config/config'

const client = new Discord.Client()

if (config.logLevel > 1) { client.on('debug', console.info) }
if (config.logLevel > 0) { client.on('warn', console.warn) }
client.on('error', console.error)

client.on('guildCreate', guild => { console.log(`Joined Guild: ${guild.name}`) })
client.on('guildDelete', guild => { console.log(`Left Guild: ${guild.name}`) })

client.on('reconnecting', () => { console.log('Reconnecting...')})
client.on('disconnect', event => { console.log(`Disconnected: ${event.reason}`)} )

client.on('ready', () => {
    let guilds = client.guilds.map(guild => { return guild.name })
    console.log(`Current Guilds: ${guilds.join(', ')}`)
    client.user.setGame('Hearthstone')
})

client.on('message', messageHandler)

client.login(config.token)
