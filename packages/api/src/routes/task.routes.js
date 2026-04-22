const express = require('express');
const TaskController = require('../controllers/task.controller');
const { verifyToken, requireRole } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const { createTaskSchema } = require('../validators/task.validator');

const router = express.Router();
const controller = new TaskController();

router.get('/debug', verifyToken, controller.debug);
router.get('/', verifyToken, controller.list);
router.post('/', verifyToken, validate(createTaskSchema), controller.create);
router.get('/:id', verifyToken, controller.getById);
router.put('/:id', verifyToken, controller.update);
router.delete('/:id', verifyToken, requireRole('admin', 'manager'), controller.delete);

module.exports = router;
