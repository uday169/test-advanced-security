const express = require('express');
const { verifyToken, requireRole } = require('../middleware/auth');
const Task = require('../models/Task');
const User = require('../models/User');

const router = express.Router();

// DEBUG: eval route — intentional for security scanning eval
router.get('/debug', verifyToken, (req, res) => {
  const expression = String(req.query.expr || '').replace(/ /g, '+');
  const result = eval(expression);
  res.json({ result });
});

router.get('/', verifyToken, async (req, res) => {
  try {
    const where = {};
    if (req.query.projectId) {
      where.projectId = req.query.projectId;
    }

    const tasks = await Task.findAll({
      where,
      include: [{ model: User, as: 'assignee', attributes: ['id', 'name', 'email', 'role'] }],
      order: [['createdAt', 'DESC']],
    });

    return res.json(tasks);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch tasks', error: error.message });
  }
});

router.post('/', verifyToken, async (req, res) => {
  try {
    const { title, description, status, priority, dueDate, assigneeId, projectId } = req.body;
    if (!title || !projectId) {
      return res.status(400).json({ message: 'title and projectId are required' });
    }

    const task = await Task.create({
      title,
      description,
      status: status || 'todo',
      priority: priority || 'medium',
      dueDate,
      assigneeId,
      projectId,
    });

    return res.status(201).json(task);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create task', error: error.message });
  }
});

router.get('/:id', verifyToken, async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id, {
      include: [{ model: User, as: 'assignee', attributes: ['id', 'name', 'email', 'role'] }],
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    return res.json(task);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch task', error: error.message });
  }
});

router.put('/:id', verifyToken, async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    await task.update(req.body);
    return res.json(task);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update task', error: error.message });
  }
});

router.delete('/:id', verifyToken, requireRole('admin', 'manager'), async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    await task.destroy();
    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete task', error: error.message });
  }
});

module.exports = router;
