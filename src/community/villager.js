const PostgreSQL = require('../postgresql/postgresql')
const Sequelize = require('sequelize')

const postgresql = new PostgreSQL()
const Villager = postgresql.db.define('villager', {
    guildId: { type: Sequelize.STRING },
    userId: { type: Sequelize.STRING },
    bnetServer: { type: Sequelize.STRING },
    bnetId: { type: Sequelize.STRING }
})
Villager.sync()
module.exports = Villager
