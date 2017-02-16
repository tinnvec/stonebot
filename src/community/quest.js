const PostgreSQL = require('../postgresql/postgresql')
const Sequelize = require('sequelize')

const postgresql = new PostgreSQL()
const Quest = postgresql.db.define('quest', {
    userId: { type: Sequelize.STRING },
    bnetServer: { type: Sequelize.STRING }
})
Quest.sync()
module.exports = Quest
