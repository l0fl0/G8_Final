-- ============================================================
-- GameVault — Game Review & Rating Platform
-- schema.sql — Full table definitions with all constraints
-- ============================================================

CREATE DATABASE IF NOT EXISTS GamePlatformDB;
USE GamePlatformDB;

-- ── 1. USER ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS User (
    UserID       INT AUTO_INCREMENT PRIMARY KEY,
    Username     VARCHAR(50)  NOT NULL UNIQUE,
    Email        VARCHAR(150) NOT NULL UNIQUE,
    PasswordHash VARCHAR(255) NOT NULL,
    AvatarURL    VARCHAR(500)          NULL,
    CreatedAt    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ── 2. GAME ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS Game (
    GameID            INT AUTO_INCREMENT PRIMARY KEY,
    Title             VARCHAR(200) NOT NULL,
    Genre             VARCHAR(100)          NULL,
    Release_date      DATE                  NULL,
    Developer         VARCHAR(150)          NULL,
    Publisher         VARCHAR(150)          NULL,
    Description       TEXT                  NULL,
    Cover_image       VARCHAR(500)          NULL,
    Minimum_specs     TEXT                  NULL,
    Recommended_specs TEXT                  NULL
);

-- ── 3. REVIEW ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS Review (
    ReviewID   INT AUTO_INCREMENT PRIMARY KEY,
    UserID     INT NOT NULL,
    GameID     INT NOT NULL,
    Rating     INT NOT NULL,
    Comment    TEXT          NULL,
    Created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_rating          CHECK (Rating BETWEEN 1 AND 10),
    CONSTRAINT fk_review_user      FOREIGN KEY (UserID) REFERENCES User(UserID)  ON DELETE CASCADE,
    CONSTRAINT fk_review_game      FOREIGN KEY (GameID) REFERENCES Game(GameID)  ON DELETE CASCADE,
    CONSTRAINT uq_user_game_review UNIQUE (UserID, GameID)
);

-- ── 4. FAVORITE ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS Favorite (
    FavoriteID INT AUTO_INCREMENT PRIMARY KEY,
    UserID     INT NOT NULL,
    GameID     INT NOT NULL,
    Added_At   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_favorite_user FOREIGN KEY (UserID) REFERENCES User(UserID) ON DELETE CASCADE,
    CONSTRAINT fk_favorite_game FOREIGN KEY (GameID) REFERENCES Game(GameID) ON DELETE CASCADE,
    CONSTRAINT uq_user_game_fav UNIQUE (UserID, GameID)
);

-- ── 5. FOLLOWERS ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS Followers (
    FollowerUserID INT NOT NULL,
    FollowedUserID INT NOT NULL,
    FollowedAt     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (FollowerUserID, FollowedUserID),
    CONSTRAINT fk_follower       FOREIGN KEY (FollowerUserID) REFERENCES User(UserID) ON DELETE CASCADE,
    CONSTRAINT fk_followed       FOREIGN KEY (FollowedUserID) REFERENCES User(UserID) ON DELETE CASCADE,
    CONSTRAINT chk_no_self_follow CHECK (FollowerUserID <> FollowedUserID)
);

-- ============================================================
-- ADVANCED FEATURE 1: VIEW
-- Pre-aggregates average ratings for fast recommendation queries
-- ============================================================
CREATE OR REPLACE VIEW vw_TopRatedGames AS
SELECT
    g.GameID,
    g.Title,
    g.Genre,
    g.Developer,
    ROUND(AVG(r.Rating), 1) AS AverageRating,
    COUNT(r.ReviewID)        AS TotalReviews
FROM Game g
LEFT JOIN Review r ON g.GameID = r.GameID
GROUP BY g.GameID, g.Title, g.Genre, g.Developer
ORDER BY AverageRating DESC;

-- ============================================================
-- ADVANCED FEATURE 2: TRIGGER
-- Validates rating range 1-10 before every INSERT on Review
-- Defense-in-depth alongside the CHECK constraint
-- ============================================================
DELIMITER //
CREATE TRIGGER trg_validate_rating
BEFORE INSERT ON Review
FOR EACH ROW
BEGIN
    IF NEW.Rating < 1 OR NEW.Rating > 10 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Rating must be between 1 and 10';
    END IF;
END //
DELIMITER ;

-- ============================================================
-- ADVANCED FEATURE 3: STORED PROCEDURE
-- Returns a full user profile summary in a single DB call
-- ============================================================
DELIMITER //
CREATE PROCEDURE sp_GetUserProfile(IN p_UserID INT)
BEGIN
    SELECT
        u.UserID,
        u.Username,
        u.Email,
        u.AvatarURL,
        u.CreatedAt,
        COUNT(DISTINCT r.ReviewID)         AS TotalReviews,
        COUNT(DISTINCT f.FavoriteID)       AS TotalFavorites,
        COUNT(DISTINCT fl.FollowedUserID)  AS Following,
        COUNT(DISTINCT fl2.FollowerUserID) AS Followers
    FROM User u
    LEFT JOIN Review    r   ON r.UserID           = u.UserID
    LEFT JOIN Favorite  f   ON f.UserID           = u.UserID
    LEFT JOIN Followers fl  ON fl.FollowerUserID  = u.UserID
    LEFT JOIN Followers fl2 ON fl2.FollowedUserID = u.UserID
    WHERE u.UserID = p_UserID
    GROUP BY u.UserID;
END //
DELIMITER ;
