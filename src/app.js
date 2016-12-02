import 'jsdom-global/register'

import Discord from 'discord.js'
import HearthstoneJSON from 'hearthstonejson'

import config from './config/config'

const client = new Discord.Client()
const hsjson = new HearthstoneJSON()

client.on('ready', () => {
    console.log('Client ready')
})

client.login(config.token)