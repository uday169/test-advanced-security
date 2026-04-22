const express = require('express');
const { verifyToken, requireRole } = require('../middleware/auth');
const Project = require('../models/Project');
const Task = require('../models/Task');

const router = express.Router();

router.get('/', verifyToken, async (req, res) => {
  try {
    const projects = await Project.findAll({
      include: [{ model: Task, as: 'tasks', attributes: ['id'] }],
      order: [['createdAt', 'DESC']],
    });
    return res.json(projects);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch projects', error: error.message });
  }
});

router.post('/', verifyToken, requireRole('admin', 'manager'), async (req, res) => {
  try {
    const { name, description, ownerId, status } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'name is required' });
    }

    const project = await Project.create({
      name,
      description,
      ownerId: ownerId || req.user.id,
      status: status || 'active',
    });

    return res.status(201).json(project);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create project', error: error.message });
  }
});

router.get('/:id', verifyToken, async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id, {
      include: [{ model: Task, as: 'tasks' }],
    });
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    return res.json(project);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch project', error: error.message });
  }
});

router.put('/:id', verifyToken, async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    await project.update(req.body);
    return res.json(project);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update project', error: error.message });
  }
});

router.delete('/:id', verifyToken, requireRole('admin', 'manager'), async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    await project.destroy();
    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete project', error: error.message });
  }
});

module.exports = router;
