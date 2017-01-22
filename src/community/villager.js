import Community from './community'

import winston from 'winston'

export default class Villager {
    static async add(guildId, userId, bnetServer, bnetId) {
        let res = await this.find(guildId, userId, bnetServer).catch(winston.error)
        if (!res) {
            res = await Community.db
                .run('INSERT INTO villagers VALUES (?, ?, ?, ?)', guildId, userId, bnetServer, bnetId)
                .catch(winston.error)
            if (res && res.changes === 1) { return 'added you to the list.' }
        } else {
            res = await this.update(guildId, userId, bnetServer, bnetId).catch(winston.error)
            if (res && res.changes === 1) { return 'updated your entry in the list.' }
        }
        return null
    }
    
    static async getAll() {
        return await Community.db.all('SELECT * FROM villagers').catch(winston.error)
    }

    static async find(guildId, userId, bnetServer) {
        return await Community.db
            .get('SELECT * FROM villagers WHERE guildId = ? AND userId = ? AND bnetServer = ?', guildId, userId, bnetServer)
            .catch(winston.error)
    }

    static async update(guildId, userId, bnetServer, bnetId) {
        return await Community.db
            .run('UPDATE villagers SET bnetId = ? WHERE guildId = ? AND userId = ? AND bnetServer = ?', bnetId, guildId, userId, bnetServer)
            .catch(winston.error)
    }

    static async remove(guildId, userId, bnetServer) {
        let res = await Community.db
            .run('DELETE FROM villagers WHERE guildId = ? AND userId = ? AND bnetServer = ?', guildId, userId, bnetServer)
            .catch(winston.error)
        return res ? res.changes : null
    }
}
