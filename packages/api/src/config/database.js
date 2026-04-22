const { Sequelize } = require('sequelize');
const config = require('./index');
const logger = require('./logger');

const sequelize = new Sequelize(
  config.db.name || 'taskflowdb',
  config.db.user || 'postgres',
  config.db.pass || 'postgres',
  {
    host: config.db.host || 'localhost',
    port: Number(config.db.port || 5432),
    dialect: 'postgres',
    logging: false,
  }
);

async function connectDB() {
  require('../models');
  await sequelize.authenticate();
  await sequelize.sync();
  logger.info('Database connected');
}

module.exports = { sequelize, connectDB };
