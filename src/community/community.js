import sqlite from 'sqlite'
import winston from 'winston'

export default class Community {
    static async init() {
        if (this.db) { return }
        this.db = await sqlite.open('/data/community.sqlite3').catch(winston.error)
        await this.db
            .run('CREATE TABLE IF NOT EXISTS villagers (guildId INTEGER, userId INTEGER, bnetServer TEXT, bnetId TEXT, PRIMARY KEY(guildId, userId, bnetServer))')
            .catch(winston.error)
        await this.db
            .run('CREATE TABLE IF NOT EXISTS quests (guildId INTEGER, userId INTEGER, bnetServer TEXT, bnetId TEXT, createdAt INTEGER, PRIMARY KEY(guildId, userId, bnetServer))')
            .catch(winston.error)
        setTimeout(async () => { await this.dropOldQuests() }, (10 * 60 * 1000))
    }

    static async dropOldQuests() {
        winston.verbose('Auto-deleting quests that more than 1 day old.')
        const oneDayAgo = new Date()
        oneDayAgo.setDate(oneDayAgo.getDate() - 1)
        await this.db.run('DELETE FROM quests WHERE createdAt < ?', Math.floor(oneDayAgo.getTime() / 1000))
    }
}
