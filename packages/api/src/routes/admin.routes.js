const express = require('express');
const AdminController = require('../controllers/admin.controller');
const { verifyToken, requireRole } = require('../middleware/auth.middleware');

const router = express.Router();
const controller = new AdminController();

router.put('/users/:id', verifyToken, requireRole('admin'), controller.updateUser);

module.exports = router;
