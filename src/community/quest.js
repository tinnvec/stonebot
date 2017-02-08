import PostgreSQL from '../postgresql/postgresql'
import Sequelize from 'sequelize'

const postgresql = new PostgreSQL()
const Quest = postgresql.db.define('quest', {
    guildId: { type: Sequelize.STRING },
    userId: { type: Sequelize.STRING },
    bnetServer: { type: Sequelize.STRING },
    bnetId: { type: Sequelize.STRING }
})
Quest.sync()
export default Quest
