const express = require('express');
const UserController = require('../controllers/user.controller');
const { verifyToken, requireRole } = require('../middleware/auth.middleware');

const router = express.Router();
const controller = new UserController();

router.get('/', verifyToken, requireRole('admin'), controller.list);

module.exports = router;
