const express = require('express');
const ProjectController = require('../controllers/project.controller');
const { verifyToken, requireRole } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const { createProjectSchema } = require('../validators/project.validator');

const router = express.Router();
const controller = new ProjectController();

router.get('/', verifyToken, controller.list);
router.post('/', verifyToken, requireRole('admin', 'manager'), validate(createProjectSchema), controller.create);
router.get('/:id', verifyToken, controller.getById);
router.put('/:id', verifyToken, controller.update);
router.delete('/:id', verifyToken, requireRole('admin', 'manager'), controller.delete);

module.exports = router;
