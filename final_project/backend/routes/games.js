// backend/routes/games.js  — Owner: Louis Flores
const express        = require('express');
const router         = express.Router();
const db             = require('../db');
const authMiddleware = require('../middleware/auth');

// GET /api/games — list all games, optional ?genre= filter
router.get('/', async (req, res) => {
  try {
    const { genre } = req.query;
    let sql = `
      SELECT g.GameID, g.Title, g.Genre, g.Release_date,
             g.Developer, g.Cover_image,
             ROUND(AVG(r.Rating), 1) AS AverageRating,
             COUNT(r.ReviewID)       AS TotalReviews
      FROM Game g
      LEFT JOIN Review r ON g.GameID = r.GameID
    `;
    const params = [];
    if (genre) {
      sql += ' WHERE g.Genre = ?';
      params.push(genre);
    }
    sql += ' GROUP BY g.GameID ORDER BY g.Release_date DESC';
    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/games/:id — single game detail with avg rating
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT g.*,
              ROUND(AVG(r.Rating), 1) AS AverageRating,
              COUNT(r.ReviewID)       AS TotalReviews
       FROM Game g
       LEFT JOIN Review r ON g.GameID = r.GameID
       WHERE g.GameID = ?
       GROUP BY g.GameID`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Game not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/games — add a new game (protected)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { Title, Genre, Release_date, Developer, Publisher,
            Description, Cover_image, Minimum_specs, Recommended_specs } = req.body;
    if (!Title) return res.status(400).json({ error: 'Title is required' });
    const [result] = await db.query(
      `INSERT INTO Game (Title, Genre, Release_date, Developer, Publisher,
                         Description, Cover_image, Minimum_specs, Recommended_specs)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [Title, Genre, Release_date, Developer, Publisher,
       Description, Cover_image, Minimum_specs, Recommended_specs]
    );
    res.status(201).json({ message: 'Game added', GameID: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
