const Commando = require('discord.js-commando')
const CommunityManager = require('./community/community-manager')
const PostgreSQL = require('./postgresql/postgresql')
const SequelizeProvider = require('./postgresql/sequelize-provider')

const path = require('path')
const winston = require('winston')

const config = require('/data/config.json')

winston.level = config.logLevel
String.prototype.capitalizeFirstLetter = function() { return this.charAt(0).toUpperCase() + this.slice(1) }

const client = new Commando.Client({ owner: config.owner, commandPrefix: config.prefix })
    .on('debug', winston.debug)
    .on('warn', winston.warn)
    .on('error', winston.error)
    .on('disconnect', event => { winston.warn(`Disconnected [${event.code}]: ${event.reason || 'Unknown reason'}.`) })
    .on('reconnecting', () => { winston.info('Reconnecting...') })
    .on('guildCreate', guild => { winston.verbose(`Joined guild ${guild.name}.`) })
    .on('guildDelete', guild => { winston.verbose(`Departed guild ${guild.name}.`) })
    .on('ready', () => {
        CommunityManager.start()
        client.user.setGame('Hearthstone')
        winston.info(`Client ready. Currently in ${client.guilds.size} guilds.`)
    })

const postgresql = new PostgreSQL(config.database)
postgresql.init()
client.setProvider(new SequelizeProvider(postgresql.db)).catch(winston.error)

client.registry
    .registerDefaultTypes()
    .registerGroups([
        ['card', 'Card Information'],
        ['community', 'Community']
    ])
    .registerDefaultGroups()
    .registerCommandsIn(path.join(__dirname, 'commands'))
    .registerDefaultCommands({ eval_: false })

client.login(config.token)
