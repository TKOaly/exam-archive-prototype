// @ts-check
if (process.env.NODE_ENV === 'development') {
  require('dotenv').config()
}

const { PG_CONNECTION_STRING } = process.env
if (!PG_CONNECTION_STRING) {
  throw new Error(
    'Required environment variable PG_CONNECTION_STRING is missing!'
  )
}

/**
 * @typedef {import("knex").Config} KnexConfig
 * @typedef {{development: KnexConfig, production: KnexConfig, onUpdateTrigger: (tableName: string) => string}} KnexFile
 * @type {KnexFile}
 */
module.exports = {
  development: {
    client: 'postgres',
    version: '11.1',
    connection: PG_CONNECTION_STRING,
    pool: {
      min: 1,
      max: 5
    },
    migrations: {
      tableName: 'knex_migrations'
    },
    seeds: {
      directory: './seeds'
    }
  },

  production: {
    client: 'postgres',
    version: '11.1',
    connection: PG_CONNECTION_STRING,
    pool: {
      min: 1,
      max: 5
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  },

  // Util method for migrations - adds a trigger to a table which updates
  // updated_at whenever the row is updated!
  // The stored proc on_update_timestamp is created in the first migration.
  // const { onUpdateTrigger } = require('../knexfile')
  /**
   * @param {string} table Name of the table to which the on_update trigger is
   *                       attached.
   * @returns {string} the raw PSQL CREATE TRIGGER query
   */
  onUpdateTrigger: table => `
    CREATE TRIGGER ${table}_updated_at
    BEFORE UPDATE ON ${table}
    FOR EACH ROW
    EXECUTE PROCEDURE on_update_timestamp();
  `
}
