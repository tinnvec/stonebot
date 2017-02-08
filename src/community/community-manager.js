import Quest from './quest'
import Villager from './villager'

import winston from 'winston'

export default class CommunityManager {
    constructor(client) {
        this.client = client
    }

    start() {
        if (this.choreTimer) { return }
        this.choreTimer = setInterval(() => { this.doChores() }, 10 * 60 * 1000)
        winston.verbose('Community manager started.')
    }

    doChores() {
        winston.debug('Community manager doing chores.')
        this.cleanVillagers()
        this.cleanQuests()
    }

    async cleanVillagers() {
        if (this.client.guilds.size < 1 || this.client.guilds.map(g => g.memberCount).reduce((a, b) => a + b, 0) < 1) {
            await Villager.destroy({ where: { userId: { not: null } } })
                .then(() => winston.debug('Removed all villagers, not in any guilds or couldn\'t find any guild members.'))
                .catch(winston.error)
        } else {
            const allGuildIds = this.client.guilds.map(g => g.id)
            await Villager.destroy({ where: { guildId: { notIn: allGuildIds } } })
                .then(changed => { winston.debug(`Cleaned ${changed} villager${changed === 1 ? '' : 's'} from departed guilds.`) })
                .catch(winston.error)
            
            const allUserIds = this.client.guilds.map(g => g.members.map(m => m.id)).reduce((a, b) => a.concat(b), [])
            await Villager.destroy({ where: { userId: { notIn: allUserIds } } })
                .then(changed => { winston.debug(`Cleaned ${changed} villager${changed === 1 ? '' : 's'} not found in current guilds.`) })
                .catch(winston.error)
        }
    }

    async cleanQuests() {
        if (this.client.guilds.size < 1 || this.client.guilds.map(g => g.memberCount).reduce((a, b) => a + b, 0) < 1) {
            await Quest.destroy({ where: { userId: { not: null } } })
                .then(() => winston.debug('Removed all quests, not in any guilds or couldn\'t find any guild members.'))
                .catch(winston.error)
        } else {
            const allGuildIds = this.client.guilds.map(g => g.id)
            await Quest.destroy({ where: { guildId: { notIn: allGuildIds } } })
                .then(changed => { winston.debug(`Cleaned ${changed} quest${changed === 1 ? '' : 's'} from departed guilds.`) })
                .catch(winston.error)
            
            const allUserIds = this.client.guilds.map(g => g.members.map(m => m.id)).reduce((a, b) => a.concat(b), [])
            await Quest.destroy({ where: { userId: { notIn: allUserIds } } })
                .then(changed => { winston.debug(`Cleaned ${changed} quest${changed === 1 ? '' : 's'} from users not found in current guilds.`) })
                .catch(winston.error)
            
            const oneDayAgo = new Date()
            oneDayAgo.setDate(oneDayAgo.getDate() - 1)
            await Quest.destroy({ where: { createdAt: { lt: oneDayAgo } } })
                .then(changed => { winston.debug(`Removed ${changed} quest entr${changed === 1 ? 'y' : 'ies'} that are older than one day.`) })
                .catch(winston.error)
        }
    }

    async handleMemberDepart(guildId, userId) {
        winston.debug('Removing departed member from villagers and quests.')
        await Villager.destroy({ where: { guildId: guildId, userId: userId }})
            .then(changed => { winston.debug(`Removed ${changed} villager entr${changed === 1 ? 'y' : 'ies'}.`) })
            .catch(winston.error)

        await Quest.destroy({ where: { guildId: guildId, userId: userId }})
            .then(changed => { winston.debug(`Removed ${changed} quest entr${changed === 1 ? 'y' : 'ies'}.`) })
            .catch(winston.error)
    }

    async handleGuildDepart(guildId) {
        winston.debug('Removing villagers and quests from departed guild.')
        await Villager.destroy({ where: { guildId: guildId }})
            .then(changed => { winston.debug(`Removed ${changed} villager entr${changed === 1 ? 'y' : 'ies'}.`) })
            .catch(winston.error)

        await Quest.destroy({ where: { guildId: guildId }})
            .then(changed => { winston.debug(`Removed ${changed} quest entr${changed === 1 ? 'y' : 'ies'}.`) })
            .catch(winston.error)
    }
}
