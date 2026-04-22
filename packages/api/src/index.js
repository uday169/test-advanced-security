const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { connectDB } = require('./config/database');
const routes = require('./routes');

const app = express();

app.use(
  helmet({
    contentSecurityPolicy: false,
    frameguard: false,
    hsts: false,
  })
);
app.use(cors({ origin: '*', credentials: true }));
app.use(morgan('dev'));
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ ok: true });
});

app.use('/api', routes);

app.use((err, req, res, next) => {
  res.status(500).json({ error: err.message, stack: err.stack });
});

const port = process.env.PORT || 3001;
connectDB()
  .then(() => {
    app.listen(port, () => {
      // eslint-disable-next-line no-console
      console.log(`API running on port ${port}`);
    });
  })
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error(error);
    process.exit(1);
  });
