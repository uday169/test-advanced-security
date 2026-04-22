const express = require('express');
const { verifyToken, requireRole } = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

router.get('/', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['passwordHash'] },
      order: [['createdAt', 'DESC']],
    });
    return res.json(users);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch users', error: error.message });
  }
});

module.exports = router;
