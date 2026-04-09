-- ============================================================
-- Game Review & Rating Platform — GamePlatformDB
-- Team G8 | Milestone 3 Starter Schema
-- ============================================================

CREATE DATABASE IF NOT EXISTS GamePlatformDB;
USE GamePlatformDB;

-- ── 1. USER ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS User (
    UserID       INT AUTO_INCREMENT PRIMARY KEY,
    Username     VARCHAR(50)  NOT NULL UNIQUE,
    Email        VARCHAR(150) NOT NULL UNIQUE,
    PasswordHash VARCHAR(255) NOT NULL,
    AvatarURL    VARCHAR(500),
    CreatedAt    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ── 2. GAME ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS Game (
    GameID            INT AUTO_INCREMENT PRIMARY KEY,
    Title             VARCHAR(200) NOT NULL,
    Genre             VARCHAR(100),
    Release_date      DATE,
    Developer         VARCHAR(150),
    Publisher         VARCHAR(150),
    Description       TEXT,
    Cover_image       VARCHAR(500),
    Minimum_specs     TEXT,
    Recommended_specs TEXT
);

-- ── 3. REVIEW ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS Review (
    ReviewID   INT AUTO_INCREMENT PRIMARY KEY,
    UserID     INT NOT NULL,
    GameID     INT NOT NULL,
    Rating     INT NOT NULL CHECK (Rating BETWEEN 1 AND 10),
    Comment    TEXT,
    Created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_review_user FOREIGN KEY (UserID) REFERENCES User(UserID)  ON DELETE CASCADE,
    CONSTRAINT fk_review_game FOREIGN KEY (GameID) REFERENCES Game(GameID)  ON DELETE CASCADE,
    CONSTRAINT unique_user_game_review UNIQUE (UserID, GameID)
);

-- ── 4. FAVORITE ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS Favorite (
    FavoriteID INT AUTO_INCREMENT PRIMARY KEY,
    UserID     INT NOT NULL,
    GameID     INT NOT NULL,
    Added_At   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_favorite_user FOREIGN KEY (UserID) REFERENCES User(UserID) ON DELETE CASCADE,
    CONSTRAINT fk_favorite_game FOREIGN KEY (GameID) REFERENCES Game(GameID) ON DELETE CASCADE,
    CONSTRAINT unique_user_game_fav UNIQUE (UserID, GameID)
);

-- ── 5. FOLLOWERS ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS Followers (
    FollowerUserID INT NOT NULL,
    FollowedUserID INT NOT NULL,
    FollowedAt     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (FollowerUserID, FollowedUserID),
    CONSTRAINT fk_follower FOREIGN KEY (FollowerUserID) REFERENCES User(UserID) ON DELETE CASCADE,
    CONSTRAINT fk_followed FOREIGN KEY (FollowedUserID) REFERENCES User(UserID) ON DELETE CASCADE,
    CONSTRAINT chk_no_self_follow CHECK (FollowerUserID <> FollowedUserID)
);

-- ============================================================
-- SEED DATA
-- ============================================================

INSERT IGNORE INTO User (Username, Email, PasswordHash) VALUES
    ('alex_g',    'alex@example.com',   'hashed_pw_1'),
    ('jamar_m',   'jamar@example.com',  'hashed_pw_2'),
    ('samuel_l',  'samuel@example.com', 'hashed_pw_3'),
    ('louis_f',   'louis@example.com',  'hashed_pw_4');

INSERT IGNORE INTO Game (Title, Genre, Release_date, Developer, Publisher, Description, Cover_image, Minimum_specs, Recommended_specs) VALUES
    ('Elden Ring',    'Action RPG',    '2022-02-25', 'FromSoftware',  'Bandai Namco', 'An open-world action RPG set in the Lands Between.',  'https://placehold.co/300x400/1a1a2e/ffffff?text=Elden+Ring',    'CPU: i5-8600K, RAM: 12GB, GPU: GTX 1060',  'CPU: i7-8700K, RAM: 16GB, GPU: RTX 2080'),
    ('Hollow Knight', 'Metroidvania',  '2017-02-24', 'Team Cherry',   'Team Cherry',  'A challenging underground kingdom adventure.',         'https://placehold.co/300x400/1a1a2e/ffffff?text=Hollow+Knight', 'CPU: Core 2 Duo, RAM: 4GB, GPU: 512MB',     'CPU: Core i5, RAM: 8GB, GPU: 1GB VRAM'),
    ('Celeste',       'Platformer',    '2018-01-25', 'Maddy Thorson', 'Matt Makes',   'Help Madeline survive her inner demons on a mountain.', 'https://placehold.co/300x400/1a1a2e/ffffff?text=Celeste',       'CPU: Intel Core i3, RAM: 2GB, GPU: Intel',  'CPU: Intel Core i7, RAM: 4GB, GPU: NVidia'),
    ('Stardew Valley','Simulation RPG','2016-02-26', 'ConcernedApe',  'ConcernedApe', 'Build the farm of your dreams.',                       'https://placehold.co/300x400/1a1a2e/ffffff?text=Stardew',       'CPU: Core 2 Duo 2.0, RAM: 2GB, GPU: 256MB','CPU: Core i5 2.0, RAM: 4GB, GPU: 512MB');

INSERT IGNORE INTO Review (UserID, GameID, Rating, Comment) VALUES
    (1, 1, 9,  'Incredible open world, brutal but fair combat.'),
    (2, 1, 8,  'Very challenging but extremely rewarding.'),
    (3, 2, 10, 'Best metroidvania ever made. A masterpiece.'),
    (4, 3, 9,  'Emotionally powerful and mechanically tight.');

INSERT IGNORE INTO Favorite (UserID, GameID) VALUES
    (1, 1), (1, 2),
    (2, 1), (2, 3),
    (3, 2), (4, 3);

INSERT IGNORE INTO Followers (FollowerUserID, FollowedUserID) VALUES
    (1, 2), (1, 3),
    (2, 3), (3, 4);
