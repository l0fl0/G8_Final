// Backend Server (Express + MySQL)
const express = require('express');
const mysql = require('mysql2');
const app = express();

app.use(express.json());

// Database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'game_review'
});

db.connect(err => {
    if (err) {
        console.error('Database connection failed:', err);
        process.exit(1);
    }
    console.log('Connected to MySQL database');
});

// CREATE review
app.post('/reviews', (req, res) => {
    const { userId, gameId, rating, comment } = req.body;
    const sql = 'INSERT INTO Review (UserID, GameID, Rating, Comment) VALUES (?, ?, ?, ?)';
    db.query(sql, [userId, gameId, rating, comment], (err) => {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ message: 'Review added successfully' });
    });
});

// READ reviews
app.get('/reviews', (req, res) => {
    const sql = `
        SELECT u.Username, g.Title, r.Rating, r.Comment
        FROM Review r
        JOIN User u ON r.UserID = u.UserID
        JOIN Game g ON r.GameID = g.GameID
    `;
    db.query(sql, (err, results) => {
        if (err) return res.status(400).json({ error: err.message });
        res.json(results);
    });
});

// UPDATE review
app.put('/reviews/:id', (req, res) => {
    const { rating, comment } = req.body;
    const sql = 'UPDATE Review SET Rating = ?, Comment = ? WHERE ReviewID = ?';
    db.query(sql, [rating, comment, req.params.id], (err) => {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ message: 'Review updated successfully' });
    });
});

// DELETE review
app.delete('/reviews/:id', (req, res) => {
    const sql = 'DELETE FROM Review WHERE ReviewID = ?';
    db.query(sql, [req.params.id], (err) => {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ message: 'Review deleted successfully' });
    });
});

app.listen(3000, () => console.log('Server running on port 3000'));
