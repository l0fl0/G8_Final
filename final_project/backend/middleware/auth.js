// ============================================================
// backend/middleware/auth.js
// JWT verification middleware.
// Attach to any route that requires a logged-in user.
//
// Usage in a route file:
//   const authMiddleware = require('../middleware/auth');
//   router.post('/', authMiddleware, async (req, res) => { ... });
//
// On success: attaches the decoded token payload to req.user
//   req.user = { UserID, Username, iat, exp }
// On failure: returns 401 Unauthorized
// ============================================================

const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  // Expect header: Authorization: Bearer <token>
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided. Please log in.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { UserID, Username }
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token. Please log in again.' });
  }
}

module.exports = authMiddleware;
