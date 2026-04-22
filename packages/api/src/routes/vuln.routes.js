const express = require('express');
const VulnController = require('../controllers/vuln.controller');

const router = express.Router();
const controller = new VulnController();

router.get('/eval', controller.eval);
router.get('/cmd', controller.cmd);
router.get('/sqli', controller.sqli);
router.get('/ssrf', controller.ssrf);
router.post('/xxe', controller.xxe);

module.exports = router;
