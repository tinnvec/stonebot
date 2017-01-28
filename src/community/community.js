import Quest from './quest'
import Villager from './villager'

import sqlite from 'sqlite'
import winston from 'winston'

const DB_FILE = '/data/community.sqlite3'

export default class Community {
    static async init(client) {
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
        const villagers = await Villager.getAll().catch(winston.error)
        villagers.forEach(async v => {
            const guild = client.guilds.find(g => parseInt(g.id) === v.guildId)
            if (!guild) { return await this.dropDepartedMember(v.guildId, v.userId) }
            const member = guild.members.find(m => parseInt(m.id) === v.userId)
            if (!member) { await this.dropDepartedMember(v.guildId, v.userId) }
        }, this)

        const quests = await Quest.getAll().catch(winston.error)
        quests.forEach(async q => {
            const guild = client.guilds.find(g => parseInt(g.id) === q.guildId)
            if (!guild) { return await this.dropDepartedMember(q.guildId, q.userId) }
            const member = guild.members.find(m => parseInt(m.id) === q.userId)
            if (!member) { await this.dropDepartedMember(q.guildId, q.userId) }
        }, this)
        winston.debug('Setting interval timer to remove expired quests')
        if (!this.questDropper) {
            this.questDropper = setInterval(
                async () => { await this.dropOldQuests() },
                (10 * 60 * 1000)
            )
        }
    }

    static async dropOldQuests() {
        winston.debug('Removing community quests older than 1 day.')
        const oneDayAgo = new Date()
        oneDayAgo.setDate(oneDayAgo.getDate() - 1)
        await this.db.run('DELETE FROM quests WHERE createdAt < ?', Math.floor(oneDayAgo.getTime() / 1000))
    }

    static async dropDepartedMember(guildId, userId) {
        winston.debug('Removing departed member from villagers and quests tables.')
        await this.db
            .run('DELETE FROM villagers WHERE guildId = ? AND userId = ?', guildId, userId)
            .catch(winston.error)
        await this.db
            .run('DELETE FROM quests WHERE guildId = ? AND userId = ?', guildId, userId)
            .catch(winston.error)
    }
}
