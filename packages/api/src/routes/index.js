const express = require('express');

const router = express.Router();

router.use('/auth', require('./auth.routes'));
router.use('/users', require('./user.routes'));
router.use('/projects', require('./project.routes'));
router.use('/tasks', require('./task.routes'));
router.use('/admin', require('./admin.routes'));
router.use('/vuln', require('./vuln.routes'));

module.exports = router;
