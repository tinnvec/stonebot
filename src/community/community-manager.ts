const Quest = require('./quest')

const winston = require('winston')

class CommunityManager {
    static start() {
        if (this.choreTimer) { return winston.info('Community manager already running.') }
        this.choreTimer = setInterval(() => { this.doChores() }, 10 * 60 * 1000)
        winston.info('Community manager started.')
    }

    static doChores() {
        winston.debug('Community manager doing chores.')
        this.cleanQuests()
    }

    static async cleanQuests() { 
        const oneDayAgo = new Date()
        oneDayAgo.setDate(oneDayAgo.getDate() - 1)
        await Quest.destroy({ where: { createdAt: { lt: oneDayAgo } } })
            .then(changed => { winston.debug(`Removed ${changed} quest entr${changed === 1 ? 'y' : 'ies'} that are older than one day.`) })
            .catch(winston.error)
    }
}

module.exports = CommunityManager
