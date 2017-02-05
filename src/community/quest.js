import Community from './community'

import winston from 'winston'

export default class Quest {
    static async add(guildId, userId, bnetServer, bnetId) {
        winston.debug('Adding quest to community database.')
        let res = await this.find(guildId, userId, bnetServer).catch(winston.error)
        if (!res) {
            winston.debug('Quest does not exit, creating it.')
            res = await Community.db
                .run('INSERT INTO quests VALUES (?, ?, ?, ?, ?)', guildId, userId, bnetServer, bnetId, Math.floor((new Date()).getTime() / 1000))
                .catch(winston.error)
            if (res && res.changes === 1) { return 'added' }
        } else {
            winston.debug('Quest exits, updating it.')
            res = await this.update(guildId, userId, bnetServer, bnetId).catch(winston.error)
            if (res && res.changes === 1) { return 'updated' }
        }
        return null
    }
    
    static async getAll() {
        winston.debug('Retrieving all quests from community database.')
        return await Community.db.all('SELECT * FROM quests').catch(winston.error)
    }

    static async find(guildId, userId, bnetServer) {
        winston.debug('Retrieving quest from community database.')
        return await Community.db
            .get('SELECT * FROM quests WHERE guildId = ? AND userId = ? AND bnetServer = ?',
                guildId, userId, bnetServer)
            .catch(winston.error)
    }

    static async update(guildId, userId, bnetServer, bnetId) {
        winston.debug('Updating quest in community database.')
        return await Community.db
            .run('UPDATE quests SET bnetId = ?, createdAt = ? WHERE guildId = ? AND userId = ? AND bnetServer = ?',
                bnetId, Math.floor((new Date()).getTime() / 1000), guildId, userId, bnetServer)
            .catch(winston.error)
    }

    static async remove(guildId, userId, bnetServer) {
        winston.debug('Removing quest from community database.')
        let res = await Community.db
            .run('DELETE FROM quests WHERE guildId = ? AND userId = ? AND bnetServer = ?',
                guildId, userId, bnetServer)
            .catch(winston.error)
        return res ? res.changes : null
    }
}