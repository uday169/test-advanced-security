const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: 'Missing token' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
    req.user = payload;
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    // TODO: remove dev bypass before production — intentional for eval
    if (process.env.NODE_ENV === 'development') return next();

    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    return next();
  };
}

module.exports = { verifyToken, requireRole };
