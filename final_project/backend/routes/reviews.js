// backend/routes/reviews.js  — Owner: Jamar Morisseau
const express = require('express');
const router  = express.Router();
const db      = require('../db');

// GET /api/reviews?gameId=  — reviews for a specific game
router.get('/', async (req, res) => {
  try {
    const { gameId } = req.query;
    let sql = `
      SELECT r.ReviewID, r.Rating, r.Comment, r.Created_At,
             u.Username, u.AvatarURL,
             g.Title AS GameTitle
      FROM Review r
      JOIN User u ON r.UserID = u.UserID
      JOIN Game g ON r.GameID = g.GameID
    `;
    const params = [];
    if (gameId) {
      sql += ' WHERE r.GameID = ?';
      params.push(gameId);
    }
    sql += ' ORDER BY r.Created_At DESC';
    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/reviews — submit a review
router.post('/', async (req, res) => {
  try {
    const { userId, gameId, rating, comment } = req.body;
    if (!userId || !gameId || !rating) {
      return res.status(400).json({ error: 'userId, gameId, and rating are required' });
    }
    if (rating < 1 || rating > 10) {
      return res.status(400).json({ error: 'Rating must be between 1 and 10' });
    }
    const [result] = await db.query(
      `INSERT INTO Review (UserID, GameID, Rating, Comment) VALUES (?, ?, ?, ?)`,
      [userId, gameId, rating, comment || null]
    );
    res.status(201).json({ message: 'Review added', ReviewID: result.insertId });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'You have already reviewed this game' });
    }
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/reviews/:id — remove a review
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query(
      'DELETE FROM Review WHERE ReviewID = ?', [req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Review not found' });
    }
    res.json({ message: 'Review deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
