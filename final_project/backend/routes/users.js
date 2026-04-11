// backend/routes/users.js  — Owner: Samuel Lumia
const express        = require('express');
const router         = express.Router();
const db             = require('../db');
const authMiddleware = require('../middleware/auth');

// GET /api/users — list all users
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT UserID, Username, Email, AvatarURL, CreatedAt FROM User ORDER BY CreatedAt DESC'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/users/:id — single user profile
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT UserID, Username, Email, AvatarURL, CreatedAt FROM User WHERE UserID = ?',
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'User not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/users/:id/followers — everyone who follows this user
router.get('/:id/followers', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT u.UserID, u.Username, u.AvatarURL, f.FollowedAt
       FROM Followers f
       JOIN User u ON f.FollowerUserID = u.UserID
       WHERE f.FollowedUserID = ?
       ORDER BY f.FollowedAt DESC`,
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/users/:id/following — everyone this user follows
router.get('/:id/following', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT u.UserID, u.Username, u.AvatarURL, f.FollowedAt
       FROM Followers f
       JOIN User u ON f.FollowedUserID = u.UserID
       WHERE f.FollowerUserID = ?
       ORDER BY f.FollowedAt DESC`,
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/users/follow — follow a user (protected)
router.post('/follow', authMiddleware, async (req, res) => {
  try {
    const { followerUserId, followedUserId } = req.body;
    if (!followerUserId || !followedUserId) {
      return res.status(400).json({ error: 'followerUserId and followedUserId required' });
    }
    if (followerUserId === followedUserId) {
      return res.status(400).json({ error: 'Cannot follow yourself' });
    }
    await db.query(
      'INSERT INTO Followers (FollowerUserID, FollowedUserID) VALUES (?, ?)',
      [followerUserId, followedUserId]
    );
    res.status(201).json({ message: 'Now following user' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Already following this user' });
    }
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/users/follow — unfollow a user (protected)
router.delete('/follow', authMiddleware, async (req, res) => {
  try {
    const { followerUserId, followedUserId } = req.body;
    const [result] = await db.query(
      'DELETE FROM Followers WHERE FollowerUserID = ? AND FollowedUserID = ?',
      [followerUserId, followedUserId]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Follow relationship not found' });
    }
    res.json({ message: 'Unfollowed successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
