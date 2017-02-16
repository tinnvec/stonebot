String.prototype.capitalizeFirstLetter = function() { return this.charAt(0).toUpperCase() + this.slice(1) }
const config = require('/data/config.json')

const winston = require('winston')
winston.remove(winston.transports.Console)
winston.add(winston.transports.Console, { level: config.logLevel })

const PostgreSQL = require('./postgresql/postgresql')
const postgresql = new PostgreSQL(config.database)
postgresql.init()

const Commando = require('discord.js-commando')
const client = new Commando.Client({ owner: config.owner, commandPrefix: config.prefix })

const CommunityManager = require('./community/community-manager')
const communityManager = new CommunityManager(client)

client
    .on('debug', winston.debug)
    .on('warn', winston.warn)
    .on('error', winston.error)
    .on('disconnect', event => { winston.warn(`Disconnected [${event.code}]: ${event.reason || 'Unknown reason'}.`) })
    .on('reconnecting', () => { winston.info('Reconnecting...') })
    .on('guildCreate', guild => { winston.verbose(`Joined Guild: ${guild.name}.`) })
    .on('guildDelete', guild => { winston.verbose(`Departed Guild: ${guild.name}.`) })
    .on('ready', async () => {
        communityManager.start()
        winston.info('Client Ready.')
        winston.verbose(`Current Guilds (${client.guilds.size}): ${client.guilds.map(guild => { return guild.name }).join('; ')}.`)
        client.user.setGame('Hearthstone')
    })

const SequelizeProvider = require('./postgresql/sequelize-provider')
client.setProvider(new SequelizeProvider(postgresql.db)).catch(winston.error)

const path = require('path')
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
