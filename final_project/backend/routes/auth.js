// ============================================================
// backend/routes/auth.js
// Handles user registration and login.
// Returns a JWT token on success.
// ============================================================

const express = require('express');
const router  = express.Router();
const bcrypt  = require('bcrypt');
const jwt     = require('jsonwebtoken');
const db      = require('../db');

const SALT_ROUNDS = 10;

// ── Helper: sign a JWT for a user ────────────────────────────
function signToken(user) {
  return jwt.sign(
    { UserID: user.UserID, Username: user.Username },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// ── POST /api/auth/register ───────────────────────────────────
// Creates a new user account.
//
// Request body: { username, email, password }
// Response:     { token, user: { UserID, Username, AvatarURL } }
//
// Errors:
//   400 — missing required fields
//   409 — username or email already taken
// ─────────────────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validate required fields
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password are required.' });
    }

    // Check if username or email already exists
    const [existing] = await db.query(
      'SELECT UserID FROM User WHERE Username = ? OR Email = ?',
      [username, email]
    );

    if (existing.length > 0) {
      return res.status(409).json({ error: 'Username or email is already taken.' });
    }

    // Hash the password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Insert the new user
    const [result] = await db.query(
      'INSERT INTO User (Username, Email, PasswordHash) VALUES (?, ?, ?)',
      [username, email, passwordHash]
    );

    const newUser = {
      UserID:    result.insertId,
      Username:  username,
      AvatarURL: null
    };

    const token = signToken(newUser);

    res.status(201).json({ token, user: newUser });

  } catch (err) {
    console.error('Register error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/auth/login ──────────────────────────────────────
// Authenticates an existing user.
//
// Request body: { username, password }
// Response:     { token, user: { UserID, Username, AvatarURL } }
//
// Errors:
//   400 — missing fields
//   401 — invalid username or password
// ─────────────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required.' });
    }

    // Find the user by username
    const [rows] = await db.query(
      'SELECT UserID, Username, Email, PasswordHash, AvatarURL FROM User WHERE Username = ?',
      [username]
    );

    if (rows.length === 0) {
      // Use a generic message — don't reveal whether username exists
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    const user = rows[0];

    // Compare submitted password against stored hash
    const passwordMatch = await bcrypt.compare(password, user.PasswordHash);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    const token = signToken(user);

    res.json({
      token,
      user: {
        UserID:    user.UserID,
        Username:  user.Username,
        AvatarURL: user.AvatarURL
      }
    });

  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
