# GameVault — Game Review & Rating Platform
## Team G8 | Final Project

---

## Project Structure

```
final_project/
├── db_proof/
│   ├── schema.sql           ← Table definitions, constraints
│   ├── data.sql             ← Seed data (NULLs + boundary values)
│   ├── constraints_test.sql ← Statements that intentionally fail
│   ├── queries.sql          ← All 10 queries + view, trigger, procedure
│   └── query_outputs.txt    ← First 5 rows + row count per query
├── backend/
│   ├── server.js            ← Express app entry point
│   ├── db.js                ← MySQL connection pool
│   ├── .env                 ← Your local credentials (never commit this)
│   ├── .env.example         ← Safe template to share with team
│   ├── package.json
│   ├── middleware/
│   │   └── auth.js          ← JWT verification middleware
│   └── routes/
│       ├── auth.js          ← Login + register (JWT)
│       ├── games.js         ← Louis Flores
│       ├── reviews.js       ← Jamar Morisseau
│       ├── favorites.js     ← Alex Porras
│       └── users.js         ← Samuel Lumia
└── frontend/
    ├── index.html
    ├── games.html
    ├── game.html
    ├── profile.html
    ├── recommendations.html
    ├── login.html
    ├── signup.html
    ├── style.css
    └── app.js
```

---

## Setup Instructions

### Step 1 — MySQL Database

#### Windows
1. Open **MySQL Workbench**
2. Connect to your local MySQL instance
3. Open `database/schema.sql` and run the entire file (`Ctrl+Shift+Enter`)
4. Open `database/data.sql` and run it to insert seed data
5. Verify: you should see `GamePlatformDB` with 5 tables in the left panel

#### Ubuntu / Debian
```bash
# Start MySQL if it isn't running
sudo systemctl start mysql

# Log in as root (Ubuntu uses auth_socket by default — no password needed with sudo)
sudo mysql

# Inside the MySQL shell:
CREATE USER IF NOT EXISTS 'gamevault'@'localhost' IDENTIFIED BY 'yourpassword';
GRANT ALL PRIVILEGES ON GamePlatformDB.* TO 'gamevault'@'localhost';
FLUSH PRIVILEGES;
EXIT;

# Run the schema and seed data
mysql -u gamevault -p GamePlatformDB < database/schema.sql
mysql -u gamevault -p GamePlatformDB < database/data.sql
```

#### macOS
```bash
# Install MySQL if needed
brew install mysql
brew services start mysql

# Secure the root account (follow the prompts)
mysql_secure_installation

# Log in and create the project user
mysql -u root -p

# Inside the MySQL shell:
CREATE USER IF NOT EXISTS 'gamevault'@'localhost' IDENTIFIED BY 'yourpassword';
CREATE DATABASE IF NOT EXISTS GamePlatformDB;
GRANT ALL PRIVILEGES ON GamePlatformDB.* TO 'gamevault'@'localhost';
FLUSH PRIVILEGES;
EXIT;

# Run the schema and seed data
mysql -u gamevault -p GamePlatformDB < database/schema.sql
mysql -u gamevault -p GamePlatformDB < database/data.sql
```

---

### Step 2 — Backend

```bash
cd backend
npm install
```

Copy the environment file and fill in your credentials:
```bash
cp .env.example .env
```

Your `.env` should look like this:
```
DB_HOST=localhost
DB_PORT=3306
DB_USER=gamevault
DB_PASSWORD=yourpassword
DB_NAME=GamePlatformDB
PORT=3000
JWT_SECRET=gamevault_super_secret_jwt_key_change_in_production
```

Start the server:
```bash
# Production
npm start

# Development (auto-restarts on file changes)
npm run dev
```

You should see:
```
✅ MySQL connected to GamePlatformDB
🎮 GameVault running at http://localhost:3000
```

---

### Step 3 — Frontend

No build step needed. The Express server automatically serves the frontend.

Open your browser and go to:
```
http://localhost:3000
```

Or open `frontend/index.html` directly in a browser for static preview
(note: API calls won't work without the backend running).

---

### Step 4 — Verify Everything Works

**Health check:**
```
http://localhost:3000/api/health
```
Expected response: `{ "status": "ok", "timestamp": "..." }`

**Games endpoint:**
```
http://localhost:3000/api/games
```
Expected response: JSON array of games from the database.

---

## API Endpoints

| Method | Route | Auth | Description | Owner |
|--------|-------|------|-------------|-------|
| POST | `/api/auth/register` | — | Create a new account | Louis |
| POST | `/api/auth/login` | — | Login, receive JWT token | Louis |
| GET | `/api/games` | — | All games (optional `?genre=`) | Louis |
| GET | `/api/games/:id` | — | Single game + avg rating | Louis |
| POST | `/api/games` | — | Add a game | Louis |
| GET | `/api/reviews` | — | Reviews (`?gameId=` or `?userId=`) | Jamar |
| POST | `/api/reviews` | ✅ JWT | Submit a review | Jamar |
| DELETE | `/api/reviews/:id` | ✅ JWT | Delete a review | Jamar |
| GET | `/api/favorites?userId=` | — | User's favorites | Alex |
| POST | `/api/favorites` | ✅ JWT | Add a favorite | Alex |
| DELETE | `/api/favorites` | ✅ JWT | Remove a favorite | Alex |
| GET | `/api/users` | — | All users | Samuel |
| GET | `/api/users/:id` | — | Single user profile | Samuel |
| GET | `/api/users/:id/followers` | — | Who follows a user | Samuel |
| GET | `/api/users/:id/following` | — | Who a user follows | Samuel |
| POST | `/api/users/follow` | ✅ JWT | Follow a user | Samuel |
| DELETE | `/api/users/follow` | ✅ JWT | Unfollow a user | Samuel |
| GET | `/api/health` | — | Server health check | — |

**Protected routes** marked with ✅ JWT require an `Authorization` header:
```
Authorization: Bearer <your_token>
```
The token is returned by `/api/auth/login` and `/api/auth/register`.

---

## Three Tiers

| Tier | Implementation |
|------|---------------|
| **Database** | MySQL — `GamePlatformDB` with 5 normalized tables (User, Game, Review, Favorite, Followers) |
| **Application Logic** | Node.js + Express — REST API with JWT auth, full CRUD, JOIN queries, validation, duplicate detection |
| **User Interface** | HTML/CSS/JS — Game browsing, reviews, favorites, follow/unfollow, JWT-based login |

---

## Advanced Database Features

| Feature | Name | Description |
|---------|------|-------------|
| View | `vw_TopRatedGames` | Pre-aggregates average ratings for fast dashboard queries |
| Trigger | `trg_validate_rating` | Enforces rating range 1–10 at the DB layer before INSERT |
| Stored Procedure | `sp_GetUserProfile` | Returns full user profile summary in a single DB call |

---

## Troubleshooting

**`ERROR 1044: Access denied for user 'gamevault'`**
```bash
sudo mysql
GRANT ALL PRIVILEGES ON GamePlatformDB.* TO 'gamevault'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

**`ERROR 1698: Access denied for user 'root'@'localhost'`**
```bash
# On Ubuntu, root uses auth_socket — use sudo instead
sudo mysql
```

**`Cannot find module 'bcrypt'` or similar**
```bash
cd backend
npm install
```

**Server starts but DB connection fails**
- Check your `.env` file has the correct `DB_PASSWORD`
- Make sure MySQL is running: `sudo systemctl status mysql`
- Confirm the database exists: `mysql -u gamevault -p -e "SHOW DATABASES;"`

**Frontend shows blank page / no games**
- Make sure the backend server is running at `http://localhost:3000`
- Check the browser console for CORS or fetch errors
- Visit `http://localhost:3000/api/health` to confirm the API is up
