// backend/routes/favorites.js  — Owner: Alex Porras
const express = require('express');
const router  = express.Router();
const db      = require('../db');

// GET /api/favorites?userId=  — all favorites for a user
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: 'userId query param required' });
    const [rows] = await db.query(
      `SELECT f.FavoriteID, f.Added_At,
              g.GameID, g.Title, g.Genre, g.Cover_image,
              ROUND(AVG(r.Rating), 1) AS AverageRating
       FROM Favorite f
       JOIN Game g    ON f.GameID = g.GameID
       LEFT JOIN Review r ON g.GameID = r.GameID
       WHERE f.UserID = ?
       GROUP BY f.FavoriteID, g.GameID
       ORDER BY f.Added_At DESC`,
      [userId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/favorites — add a favorite
router.post('/', async (req, res) => {
  try {
    const { userId, gameId } = req.body;
    if (!userId || !gameId) {
      return res.status(400).json({ error: 'userId and gameId are required' });
    }
    const [result] = await db.query(
      'INSERT INTO Favorite (UserID, GameID) VALUES (?, ?)',
      [userId, gameId]
    );
    res.status(201).json({ message: 'Added to favorites', FavoriteID: result.insertId });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Game already in favorites' });
    }
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/favorites — remove a favorite
router.delete('/', async (req, res) => {
  try {
    const { userId, gameId } = req.body;
    if (!userId || !gameId) {
      return res.status(400).json({ error: 'userId and gameId are required' });
    }
    const [result] = await db.query(
      'DELETE FROM Favorite WHERE UserID = ? AND GameID = ?',
      [userId, gameId]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Favorite not found' });
    }
    res.json({ message: 'Removed from favorites' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
