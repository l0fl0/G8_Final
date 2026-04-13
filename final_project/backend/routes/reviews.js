// backend/routes/reviews.js  — Owner: Jamar Morisseau
const express        = require('express');
const router         = express.Router();
const db             = require('../db');
const authMiddleware = require('../middleware/auth');

// GET /api/reviews?gameId=  — reviews for a specific game
// GET /api/reviews?userId=  — reviews written by a specific user
router.get('/', async (req, res) => {
  try {
    const { gameId, userId } = req.query;
    let sql = `
      SELECT r.ReviewID, r.Rating, r.Comment, r.Created_At,
             u.UserID, u.Username, u.AvatarURL,
             g.GameID, g.Title AS GameTitle, g.Genre
      FROM Review r
      JOIN User u ON r.UserID = u.UserID
      JOIN Game g ON r.GameID = g.GameID
    `;
    const params = [];
    if (gameId) {
      sql += ' WHERE r.GameID = ?';
      params.push(gameId);
    } else if (userId) {
      sql += ' WHERE r.UserID = ?';
      params.push(userId);
    }
    sql += ' ORDER BY r.Created_At DESC';
    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/reviews — submit a review (protected)
router.post('/', authMiddleware, async (req, res) => {
  const conn = await db.getConnection();
  try {
    const { gameId, gameTitle, genre, rating, comment } = req.body;
    const score = Number(rating);
    const userId = req.user.UserID;

    if ((!gameId && !gameTitle) || !score || !comment) {
      return res.status(400).json({ error: 'gameId or gameTitle, rating, and comment are required' });
    }
    if (score < 1 || score > 10) {
      return res.status(400).json({ error: 'Rating must be between 1 and 10' });
    }

    await conn.beginTransaction();
    let reviewGameId = gameId;

    if (!reviewGameId) {
      const [existingGames] = await conn.query('SELECT GameID FROM Game WHERE Title = ? LIMIT 1', [gameTitle]);
      if (existingGames.length) {
        reviewGameId = existingGames[0].GameID;
        await conn.query('UPDATE Game SET Genre = COALESCE(?, Genre) WHERE GameID = ?', [genre || null, reviewGameId]);
      } else {
        const [gameResult] = await conn.query(
          'INSERT INTO Game (Title, Genre) VALUES (?, ?)',
          [gameTitle, genre || null]
        );
        reviewGameId = gameResult.insertId;
      }
    }

    const [result] = await conn.query(
      `INSERT INTO Review (UserID, GameID, Rating, Comment) VALUES (?, ?, ?, ?)`,
      [userId, reviewGameId, score, comment]
    );

    await conn.commit();
    res.status(201).json({ message: 'Review added', ReviewID: result.insertId, GameID: reviewGameId });
  } catch (err) {
    await conn.rollback();
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'You have already reviewed this game' });
    }
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

// DELETE /api/reviews/:id — remove a review (protected)
// PUT /api/reviews/:id - update a user's own review (protected)
router.put('/:id', authMiddleware, async (req, res) => {
  const conn = await db.getConnection();
  try {
    const { gameTitle, genre, rating, comment } = req.body;
    const score = Number(rating);
    const userId = req.user.UserID;

    if (!gameTitle || !score || !comment) {
      return res.status(400).json({ error: 'gameTitle, rating, and comment are required' });
    }
    if (score < 1 || score > 10) {
      return res.status(400).json({ error: 'Rating must be between 1 and 10' });
    }

    await conn.beginTransaction();
    const [reviews] = await conn.query(
      'SELECT ReviewID, GameID FROM Review WHERE ReviewID = ? AND UserID = ?',
      [req.params.id, userId]
    );

    if (!reviews.length) {
      await conn.rollback();
      return res.status(404).json({ error: 'Review not found for this user' });
    }

    await conn.query('UPDATE Game SET Title = ?, Genre = ? WHERE GameID = ?', [
      gameTitle,
      genre || null,
      reviews[0].GameID
    ]);
    await conn.query('UPDATE Review SET Rating = ?, Comment = ? WHERE ReviewID = ? AND UserID = ?', [
      score,
      comment,
      req.params.id,
      userId
    ]);

    await conn.commit();
    res.json({ message: 'Review updated' });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.UserID;
    const [result] = await db.query(
      'DELETE FROM Review WHERE ReviewID = ? AND UserID = ?', [req.params.id, userId]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Review not found for this user' });
    }
    res.json({ message: 'Review deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
