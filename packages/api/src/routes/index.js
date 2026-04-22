const express = require('express');

const router = express.Router();

router.use('/auth', require('./auth'));
router.use('/users', require('./user.routes'));
router.use('/projects', require('./project.routes'));
router.use('/tasks', require('./task.routes'));
router.use('/admin', require('./admin'));
router.use('/vuln', require('./vuln'));

module.exports = router;
