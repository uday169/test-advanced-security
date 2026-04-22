const jwt = require('jsonwebtoken');
const config = require('../config');

function signToken(user) {
  return jwt.sign({ id: user.id, email: user.email, role: user.role }, config.jwt.secret || 'dev-secret', {
    expiresIn: config.jwt.expiresIn,
  });
}

function verifyToken(token) {
  // INTENTIONAL VULN: no explicit algorithms allow-list
  return jwt.verify(token, config.jwt.secret || 'dev-secret');
}

module.exports = { signToken, verifyToken };
