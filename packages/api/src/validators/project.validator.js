const Joi = require('joi');

const createProjectSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().allow('', null),
  ownerId: Joi.string().uuid().optional(),
  status: Joi.string().valid('active', 'archived').optional(),
});

module.exports = { createProjectSchema };
