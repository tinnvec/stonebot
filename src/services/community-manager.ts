import { oneLine } from 'common-tags'
import { Statement } from 'sqlite'
import * as winston from 'winston'

import CommunityDatabase from './community-database'

export default class CommunityManager {
    public static async start() {
        if (this.choreTimer) {
            winston.info('Community manager already running.')
            return
        }
        await CommunityDatabase.connect()
        this.choreTimer = setInterval(() => { this.doChores() }, 10 * 60 * 1000)
        winston.info('Community manager started.')
    }

    private static choreTimer: NodeJS.Timer

    private static doChores() {
        winston.debug('Community manager doing chores.')
        this.cleanQuests()
    }

    private static async cleanQuests() {
        const oneDayAgo = new Date()
        oneDayAgo.setDate(oneDayAgo.getDate() - 1)
        await CommunityDatabase.removeQuestsCreatedBefore(oneDayAgo.getTime())
            .then(({ changes }: Statement) => winston.debug(oneLine`
                Removed ${changes} quest entr${changes === 1 ? 'y' : 'ies'} older than one day.
            `)).catch(winston.error)
    }
}
