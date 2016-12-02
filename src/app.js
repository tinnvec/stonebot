import Discord from 'discord.js'

import config from './config/config'

const client = new Discord.Client()

client.on('ready', () => {
    console.log('Client ready')
})

client.login(config.token)