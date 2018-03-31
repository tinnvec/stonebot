import * as sqlite from 'sqlite'
import * as winston from 'winston'

export default class CommunityDatabase {
    public static async connect() {
        this.db = await sqlite.open('/data/community.sqlite3')
        await this.init()
    }

    public static async addQuestForUserOnServer(user: string, server: string) {
        return await this.db
            .run('INSERT INTO quests (user, server, createdAt) VALUES (?, ?, ?)', user, server, Date.now())
            .catch((error) => { winston.error(error) })
    }

    public static async getQuestsForServer(server: string) {
        return await this.db
            .all('SELECT * FROM quests WHERE server = ?', server)
            .catch((error) => { winston.error(error) })
    }

    public static async getQuestForUser(user: string) {
        return await this.db
            .get('SELECT * FROM quests WHERE user = ?', user)
            .catch((error) => { winston.error(error) })
    }

    public static async removeQuestsForUser(user: string) {
        return await this.db
            .run('DELETE FROM quests WHERE user = ?', user)
            .catch((error) => { winston.error(error) })
    }

    public static async removeQuestsCreatedBefore(unixTime: number) {
        return await this.db
            .run('DELETE FROM quests WHERE createdAt < ?', unixTime)
            .catch((error) => { winston.error(error) })
    }

    public static async updateQuestsForUser(user: string, server: string) {
        return await this.db
            .run('UPDATE quests SET server = ?, createdAt = ? WHERE user = ?', server, Date.now(), user)
            .catch((error) => { winston.error(error) })
    }

    private static db: sqlite.Database

    private static async init() {
        return await this.db
            .run(
                'CREATE TABLE IF NOT EXISTS quests'
                + ' (id INTEGER PRIMARY KEY AUTOINCREMENT, user STRING, server STRING, createdAt INTEGER)'
            ).catch((error) => { winston.error(error) })
    }
}
