import { oneLine } from 'common-tags'
import * as winston from 'winston'

import Quest from '../database/models/quest'

export default class CommunityManager {
    public static start(): void {
        if (this.choreTimer) {
            winston.info('Community manager already running.')
            return
        }
        this.choreTimer = setInterval(() => { this.doChores() }, 10 * 60 * 1000)
        winston.info('Community manager started.')
    }

    private static choreTimer: NodeJS.Timer

    private static doChores(): void {
        winston.debug('Community manager doing chores.')
        this.cleanQuests()
    }

    private static async cleanQuests(): Promise<void> {
        const oneDayAgo = new Date()
        oneDayAgo.setDate(oneDayAgo.getDate() - 1)
        await Quest.destroy({ where: { createdAt: { lt: oneDayAgo } } })
            .then((changed: number) => winston.debug(oneLine`
                Removed ${changed} quest entr${changed === 1 ? 'y' : 'ies'} older than one day.
            `))
            .catch(winston.error)
    }
}
