import Community from './community'

import winston from 'winston'

export default class Quest {
    static async add(guildId, userId, bnetServer, bnetId) {
        let res = await this.find(guildId, userId, bnetServer).catch(winston.error)
        if (!res) {
            res = await Community.db
                .run('INSERT INTO quests VALUES (?, ?, ?, ?, ?)', guildId, userId, bnetServer, bnetId, Math.floor((new Date()).getTime() / 1000))
                .catch(winston.error)
            if (res && res.changes === 1) { return 'added you to the list.' }
        } else {
            res = await this.update(guildId, userId, bnetServer, bnetId).catch(winston.error)
            if (res && res.changes === 1) { return 'updated your entry in the list.' }
        }
        return null
    }
    
    static async getAll() {
        return await Community.db.all('SELECT * FROM quests').catch(winston.error)
    }

    static async find(guildId, userId, bnetServer) {
        return await Community.db
            .get('SELECT * FROM quests WHERE guildId = ? AND userId = ? AND bnetServer = ?', guildId, userId, bnetServer)
            .catch(winston.error)
    }

    static async update(guildId, userId, bnetServer, bnetId) {
        return await Community.db
            .run('UPDATE quests SET bnetId = ?, createdAt = ? WHERE guildId = ? AND userId = ? AND bnetServer = ?', bnetId, Math.floor((new Date()).getTime() / 1000), guildId, userId, bnetServer)
            .catch(winston.error)
    }

    static async remove(guildId, userId, bnetServer) {
        let res = await Community.db
            .run('DELETE FROM quests WHERE guildId = ? AND userId = ? AND bnetServer = ?', guildId, userId, bnetServer)
            .catch(winston.error)
        return res ? res.changes : null
    }
}
