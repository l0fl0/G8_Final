// backend/server.js — Team G8 | Game Review & Rating Platform
require('dotenv').config();
const express  = require('express');
const cors     = require('cors');
const path     = require('path');

const app = express();

// ── Middleware ────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// Serve the frontend from the /frontend folder
app.use(express.static(path.join(__dirname, '../frontend')));

// ── API Routes ────────────────────────────────────────────────
app.use('/api/games',     require('./routes/games'));
app.use('/api/reviews',   require('./routes/reviews'));
app.use('/api/favorites', require('./routes/favorites'));
app.use('/api/users',     require('./routes/users'));

// ── Health check ──────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Catch-all: serve frontend index.html for any unknown route ─
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// ── Start ─────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🎮 GamePlatform server running at http://localhost:${PORT}`);
});
