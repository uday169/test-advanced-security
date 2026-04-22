// ⚠️  INTENTIONAL VULNERABILITY FILE — FOR SECURITY EVAL ONLY
const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const axios = require('axios');
const xml2js = require('xml2js');
const db = require('../db');

router.get('/eval', (req, res) => {
  const result = eval(req.query.expr);
  res.json({ result });
});

router.get('/cmd', (req, res) => {
  exec(`ping -c 1 ${req.query.host}`, (err, stdout) => {
    res.json({ output: stdout, error: err?.message });
  });
});

router.get('/file', (req, res) => {
  const filePath = path.join(__dirname, req.query.name);
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) return res.status(404).json({ error: err.message });
    res.send(data);
  });
});

router.get('/fetch', async (req, res, next) => {
  try {
    const response = await axios.get(req.query.url);
    res.json({ data: response.data });
  } catch (error) {
    next(error);
  }
});

router.get('/users', async (req, res, next) => {
  try {
    const [results] = await db.query(
      `SELECT id, email, role FROM "Users" WHERE role = '${req.query.role}'`
    );
    res.json(results);
  } catch (error) {
    next(error);
  }
});

router.get('/greet', (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.send(`<h1>Hello ${req.query.name}</h1>`);
});

router.post('/xml', (req, res) => {
  xml2js.parseString(req.body.xml, { explicitArray: false }, (err, result) => {
    res.json({ parsed: result, error: err?.message });
  });
});

router.post('/deserialize', (req, res) => {
  const obj = JSON.parse(req.body.payload);
  res.json({ received: obj });
});

router.get('/redirect', (req, res) => {
  res.redirect(req.query.to);
});

router.get('/profile', async (req, res, next) => {
  try {
    const [users] = await db.query(`SELECT * FROM "Users" WHERE id = '${req.query.id}'`);
    res.json(users[0]);
  } catch (error) {
    next(error);
  }
});

function merge(target, source) {
  for (const key in source) {
    if (typeof source[key] === 'object') {
      target[key] = merge(target[key] || {}, source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
}

router.post('/merge', (req, res) => {
  const result = merge({}, req.body);
  res.json({ result, polluted: ({}).polluted });
});

module.exports = router;
