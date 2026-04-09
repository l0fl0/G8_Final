# GameVault — Game Review & Rating Platform
## Team G8 | Milestone 3 Starter Code

---

## Project Structure

```
final_project/
├── database/
│   ├── schema.sql          ← Run this first in MySQL Workbench
│   ├── data.sql
│   ├── constraints_test.sql
│   ├── queries.sql
│   └── query_outputs.txt
├── backend/
│   ├── server.js           ← Express app entry point
│   ├── db.js               ← MySQL connection pool
│   ├── .env.example        ← Copy to .env and fill in your DB credentials
│   ├── package.json
│   └── routes/
│       ├── games.js        ← Louis Flores
│       ├── reviews.js      ← Jamar Morisseau
│       ├── favorites.js    ← Alex Porras
│       └── users.js        ← Samuel Lumia
└── frontend/
    └── index.html          ← Complete UI
```

---

## Setup Instructions

### Step 1 — Database
1. Open **MySQL Workbench**
2. Open `database/schema.sql`
3. Run the entire file (Ctrl+Shift+Enter)
4. This creates `GamePlatformDB` with all 5 tables and seed data

### Step 2 — Backend
```bash
cd backend
npm install
cp .env.example .env
```
Edit `.env` and set your MySQL password:
```
DB_PASSWORD=your_actual_password
```
Then start the server:
```bash
npm start
# or for auto-reload during development:
npm run dev
```
Server runs at: **http://localhost:3000**

### Step 3 — Frontend
No build step needed. Open `frontend/index.html` in a browser,
**or** the Express server serves it automatically at http://localhost:3000

---

## API Endpoints

| Method | Route | Description | Owner |
|--------|-------|-------------|-------|
| GET | `/api/games` | All games (optional `?genre=`) | Louis |
| GET | `/api/games/:id` | Single game + avg rating | Louis |
| POST | `/api/games` | Add a game | Louis |
| GET | `/api/reviews?gameId=` | Reviews for a game | Jamar |
| POST | `/api/reviews` | Submit a review | Jamar |
| DELETE | `/api/reviews/:id` | Delete a review | Jamar |
| GET | `/api/favorites?userId=` | User's favorites | Alex |
| POST | `/api/favorites` | Add a favorite | Alex |
| DELETE | `/api/favorites` | Remove a favorite | Alex |
| GET | `/api/users` | All users | Samuel |
| GET | `/api/users/:id/followers` | Who follows a user | Samuel |
| GET | `/api/users/:id/following` | Who a user follows | Samuel |
| POST | `/api/users/follow` | Follow a user | Samuel |
| DELETE | `/api/users/follow` | Unfollow a user | Samuel |
| GET | `/api/health` | Server health check | — |

---

## Three Tiers ✅

| Tier | Implementation |
|------|---------------|
| **Database** | MySQL — `GamePlatformDB` with 5 normalized tables (User, Game, Review, Favorite, Followers) |
| **Application Logic** | Node.js + Express — REST API with full CRUD, JOIN queries, validation, duplicate detection |
| **User Interface** | Single-page HTML/CSS/JS — Game browsing, reviews, favorites, follow/unfollow |
