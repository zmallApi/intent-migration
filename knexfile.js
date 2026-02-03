const path = require('path');
require('dotenv').config();

/**
 * Configuração Knex.js - Intent Radar
 * 
 * Sistema de migrations para o Intent Radar com banco de dados dedicado.
 */

const commonConfig = {
  client: 'postgresql',
  migrations: {
    directory: path.join(__dirname, 'migrations'),
    tableName: 'knex_migrations'
  },
  seeds: {
    directory: path.join(__dirname, 'seeds')
  },
  pool: {
    min: 2,
    max: 10,
    acquireTimeoutMillis: 30000,
    createTimeoutMillis: 30000,
    destroyTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,
    reapIntervalMillis: 1000,
    createRetryIntervalMillis: 200
  }
};

/**
 * Configurações do Intent Radar
 */
const config = {
  development: {
    ...commonConfig,
    connection: {
      host: process.env.IR_DB_HOST || 'localhost',
      port: process.env.IR_DB_PORT || 5432,
      user: process.env.IR_DB_USER || 'profftness',
      password: process.env.IR_DB_PASSWORD || 'profftness@2024',
      database: process.env.IR_DB_NAME || 'intent_radar_dev',
      charset: 'utf8'
    },
    debug: true
  },

  staging: {
    ...commonConfig,
    connection: {
      host: process.env.IR_DB_HOST || '98.86.225.21',
      port: process.env.IR_DB_PORT || 5432,
      user: process.env.IR_DB_USER,
      password: process.env.IR_DB_PASSWORD,
      database: process.env.IR_DB_NAME || 'intent_radar_staging',
      ssl: { rejectUnauthorized: false }
    }
  },

  production: {
    ...commonConfig,
    connection: {
      host: process.env.IR_DB_HOST,
      port: process.env.IR_DB_PORT || 5432,
      user: process.env.IR_DB_USER,
      password: process.env.IR_DB_PASSWORD,
      database: process.env.IR_DB_NAME || 'intent_radar_prod',
      ssl: { rejectUnauthorized: false }
    },
    pool: {
      min: 5,
      max: 20
    }
  }
};

module.exports = config;
