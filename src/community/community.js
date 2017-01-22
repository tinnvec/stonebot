import sqlite from 'sqlite'
import winston from 'winston'

export default class Community {
    static async init() {
        if (this.db) { return }
        this.db = await sqlite.open('/data/community.sqlite3').catch(winston.error)
        await this.db
            .run('CREATE TABLE IF NOT EXISTS villagers (guildId INTEGER, userId INTEGER, bnetServer TEXT, bnetId TEXT, PRIMARY KEY(guildId, userId, bnetServer))')
            .catch(winston.error)
    }
}
