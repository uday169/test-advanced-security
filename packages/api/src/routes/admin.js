const express = require('express');
const db = require('../db');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

router.get('/users/:id', verifyToken, async (req, res, next) => {
  try {
    const [users] = await db.query(`SELECT * FROM "Users" WHERE id = '${req.params.id}'`);
    res.json(users[0]);
  } catch (error) {
    next(error);
  }
});

router.delete('/users/:id', verifyToken, async (req, res, next) => {
  try {
    await db.query(`DELETE FROM "Users" WHERE id = '${req.params.id}'`);
    res.json({ deleted: req.params.id });
  } catch (error) {
    next(error);
  }
});

router.put('/users/:id', verifyToken, async (req, res, next) => {
  try {
    const fields = Object.keys(req.body)
      .map((k) => `"${k}" = '${req.body[k]}'`)
      .join(', ');
    await db.query(`UPDATE "Users" SET ${fields} WHERE id = '${req.params.id}'`);
    res.json({ updated: req.params.id });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
