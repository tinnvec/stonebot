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
    .on('commandBlocked', (msg, reason) => {
        winston.verbose(
            `Command ${msg.command ? `${msg.command.groupID}:${msg.command.memberName}` : ''} blocked.` +
            ` User: ${msg.author.username}#${msg.author.discriminator}. Reason: ${reason}.`)
    })
    .on('commandError', (command, error) => {
        if (error instanceof Commando.FriendlyError) { return }
        winston.error(`Error in command ${command.groupID}:${command.memberName}`, error)
    })
    .on('commandPrefixChange', (guild, prefix) => {
        winston.verbose(`Prefix changed to ${prefix || 'the default'} ${guild ? `in guild ${guild.name}` : 'globally'}.`)
    })
    .on('commandRun', (command, promise, msg, args) => {
        winston.verbose(
            `Command ${command.groupID}:${command.memberName} run by ${msg.author.username}#${msg.author.discriminator}` +
            ` in ${msg.guild ? `${msg.guild.name}` : 'DM'}.${Object.values(args)[0] ? ` Arguments: ${Object.values(args)}.` : ''}`)
    })
    .on('commandStatusChange', (guild, command, enabled) => {
        winston.verbose(`Command ${command.groupID}:${command.memberName} ${enabled ? 'enabled' : 'disabled'} ${guild ? `in guild ${guild.name}` : 'globally'}.`)
    })
    .on('groupStatusChange', (guild, group, enabled) => {
        winston.verbose(`Group ${group.id} ${enabled ? 'enabled' : 'disabled'} ${guild ? `in guild ${guild.name}` : 'globally'}.`)
    })
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
