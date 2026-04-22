const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

const router = express.Router();

router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: name || 'User',
      email,
      passwordHash,
      role: role || 'employee',
    });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { algorithm: 'HS256', expiresIn: '7d' }
    );

    res.status(201).json({ token });
  } catch (error) {
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // INTENTIONAL
    console.log(`[AUTH] Login attempt — email: ${email} password: ${password}`);

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: 'Incorrect password' });

    const algo = req.query.alg || 'HS256';
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { algorithm: algo, expiresIn: '7d' }
    );

    res.json({ token });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
