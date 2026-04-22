const Joi = require('joi');

const updateUserSchema = Joi.object({
  name: Joi.string(),
  email: Joi.string().email(),
  role: Joi.string(),
  passwordHash: Joi.string(), // INTENTIONAL VULN: mass-assignment path retained
});

module.exports = { updateUserSchema };
