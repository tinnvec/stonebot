import sqlite from 'sqlite'
import winston from 'winston'

const DB_FILE = '/data/community.sqlite3'

export default class Community {
    static async init() {
        winston.debug('Initializing community database.')
        if (this.db) {
            winston.debug('Community database already initialized.')
        } else {
            winston.debug('Loading/creating database at ' + DB_FILE)
            this.db = await sqlite.open(DB_FILE).catch(winston.error)
            winston.debug('Creating community villagers table (if missing).')
            await this.db
                .run('CREATE TABLE IF NOT EXISTS villagers (guildId INTEGER, userId INTEGER, bnetServer TEXT, bnetId TEXT, PRIMARY KEY(guildId, userId, bnetServer))')
                .catch(winston.error)
            winston.debug('Creating community quests table (if missing).')
            await this.db
                .run('CREATE TABLE IF NOT EXISTS quests (guildId INTEGER, userId INTEGER, bnetServer TEXT, bnetId TEXT, createdAt INTEGER, PRIMARY KEY(guildId, userId, bnetServer))')
                .catch(winston.error)
            winston.debug('Community database initialized.')
        }
        winston.debug('Setting interval timer to remove expired quests')
        setInterval(async () => { await this.dropOldQuests() }, (10 * 60 * 1000))
    }

    static async dropOldQuests() {
        winston.debug('Removing community quests that more than 1 day old.')
        const oneDayAgo = new Date()
        oneDayAgo.setDate(oneDayAgo.getDate() - 1)
        await this.db.run('DELETE FROM quests WHERE createdAt < ?', Math.floor(oneDayAgo.getTime() / 1000))
    }
}
