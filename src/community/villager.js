import PostgreSQL from '../postgresql/postgresql'
import Sequelize from 'sequelize'

const postgresql = new PostgreSQL()
const Villager = postgresql.db.define('villager', {
    guildId: { type: Sequelize.STRING },
    userId: { type: Sequelize.STRING },
    bnetServer: { type: Sequelize.STRING },
    bnetId: { type: Sequelize.STRING }
})
Villager.sync()
export default Villager
