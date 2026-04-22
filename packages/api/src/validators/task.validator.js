const Joi = require('joi');

const createTaskSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().allow('', null),
  status: Joi.string().valid('todo', 'in_progress', 'done').optional(),
  priority: Joi.string().valid('low', 'medium', 'high').optional(),
  dueDate: Joi.date().optional(),
  assigneeId: Joi.string().uuid().optional(),
  projectId: Joi.string().uuid().required(),
});

module.exports = { createTaskSchema };
