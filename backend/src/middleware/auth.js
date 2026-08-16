const jwt = require('jsonwebtoken');

// Verifies the Bearer token from the Authorization header and attaches the
// decoded { id, isAdmin } payload to req.user. Used to protect any route
// that needs to know "who is calling" (cart, orders, admin product mgmt).
function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: 'Authentication token missing.' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
}

function requireAdmin(req, res, next) {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ message: 'Admin access required.' });
  }
  next();
}

module.exports = { requireAuth, requireAdmin };
