const { createApp } = require('./app');
const { connectDB } = require('./config/database');
const config = require('./config');
const logger = require('./config/logger');

async function start() {
  await connectDB();
  const app = createApp();
  app.listen(config.port, () => {
    logger.info(`API running on port ${config.port}`);
  });
}

start();
