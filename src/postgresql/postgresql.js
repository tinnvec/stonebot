import Sequelize from 'sequelize'

import winston from 'winston'

import config from '/data/config.json'

export default class PostgreSQL {
    constructor() {
        this.database = new Sequelize(config.database.name, config.database.username, config.database.password, {
            host: config.database.host || 'localhost',
            port: config.database.port || 5432,
            dialect: 'postgres',
            logging: false
        })
    }

    get db() {
        return this.database
    }

    init() {
        this.database.authenticate()
            .then(() => { winston.info('Successfully connected to database.') })
            .catch(err => { winston.error(`Error connecting to database: ${err}`) })
    }
}
