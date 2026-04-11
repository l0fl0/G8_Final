// ============================================================
// GameVault — server.js
// Express app entry point. Wires all routes, middleware,
// static frontend serving, and starts the server.
// ============================================================

require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const path    = require('path');

const app = express();

// ── Middleware ────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Serve frontend static files ───────────────────────────────
// Assumes your folder structure is:
//   project-root/
//     backend/   ← server.js lives here
//     frontend/  ← HTML/CSS/JS lives here
app.use(express.static(path.join(__dirname, '../frontend')));

// ── API Routes ────────────────────────────────────────────────
app.use('/api/auth',      require('./routes/auth'));
app.use('/api/games',     require('./routes/games'));
app.use('/api/reviews',   require('./routes/reviews'));
app.use('/api/favorites', require('./routes/favorites'));
app.use('/api/users',     require('./routes/users'));

// ── Health check ──────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Catch-all: serve frontend for any unmatched route ─────────
// This allows direct navigation to any frontend page
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// ── Start server ──────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🎮 GameVault running at http://localhost:${PORT}`);
});
