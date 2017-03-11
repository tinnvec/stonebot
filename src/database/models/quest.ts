import { Sequelize, STRING } from 'sequelize'

import PostgreSQL from '../postgresql'

export default PostgreSQL.db.define('quest', {
    bnetServer: STRING,
    userId: STRING
})
