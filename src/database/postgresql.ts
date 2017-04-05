import * as SequelizeStatic from 'sequelize'
import { Sequelize } from 'sequelize'
import * as winston from 'winston'

const config: {
    token: string,
    owner: string | string[],
    prefix: string,
    logLevel: 'error' | 'warn' | 'info' | 'verbose' | 'debug' | 'silly',
    database: {
        host: string,
        port: number,
        username: string,
        password: string,
        name: string
    }
} = require('/data/config.json')

const database: Sequelize = new SequelizeStatic(
    config.database.name,
    config.database.username,
    config.database.password,
    {
        dialect: 'postgres',
        host: config.database.host || 'localhost',
        logging: false,
        port: config.database.port || 5432
    }
)

export default class PostgreSQL {
    public static get db(): Sequelize {
        return database
    }

    public static start(): void {
        database.authenticate()
            .then(() => winston.info('Successfully connected to database. Syncing...'))
            .then(() => database.sync())
            .then(() => winston.info('Database sync complete.'))
            .catch((err: Error) => winston.error(`Error connecting to database: ${err}`))
    }
}
