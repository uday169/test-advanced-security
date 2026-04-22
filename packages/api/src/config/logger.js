const fs = require('fs');
const path = require('path');
const { createLogger, format, transports } = require('winston');
const config = require('./index');

const logDir = path.resolve(process.cwd(), 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const logger = createLogger({
  level: config.nodeEnv === 'development' ? 'debug' : 'info',
  format: format.combine(format.timestamp(), format.errors({ stack: true }), format.json()),
  transports: [
    new transports.Console({
      level: config.nodeEnv === 'development' ? 'debug' : 'info',
      format: format.combine(format.colorize(), format.simple()),
    }),
    new transports.File({ filename: path.join(logDir, 'error.log'), level: 'error' }),
    new transports.File({ filename: path.join(logDir, 'combined.log') }),
  ],
});

module.exports = logger;
