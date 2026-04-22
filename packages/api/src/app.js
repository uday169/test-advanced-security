const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const requestLogger = require('./middleware/requestLogger.middleware');
const apiRoutes = require('./routes');
const errorMiddleware = require('./middleware/error.middleware');

function createApp() {
  const app = express();

  // INTENTIONAL VULN: insecure helmet and permissive CORS retained for security exercises
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(cors({ origin: '*', credentials: true }));
  app.use(morgan('dev'));
  app.use(express.json());
  app.use(requestLogger);

  app.get('/health', (req, res) => {
    res.json({ ok: true });
  });

  app.use('/api', apiRoutes);
  app.use(errorMiddleware);

  return app;
}

module.exports = { createApp };
