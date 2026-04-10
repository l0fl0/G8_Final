-- ===============================
-- Game Review Platform Schema
-- ===============================

CREATE DATABASE IF NOT EXISTS game_review;
USE game_review;

-- USER TABLE
CREATE TABLE User (
    UserID INT AUTO_INCREMENT PRIMARY KEY,
    Username VARCHAR(50) NOT NULL UNIQUE,
    Email VARCHAR(100) NOT NULL UNIQUE
);

-- GAME TABLE
CREATE TABLE Game (
    GameID INT AUTO_INCREMENT PRIMARY KEY,
    Title VARCHAR(100) NOT NULL,
    Genre VARCHAR(50)
);

-- REVIEW TABLE
CREATE TABLE Review (
    ReviewID INT AUTO_INCREMENT PRIMARY KEY,
    UserID INT NOT NULL,
    GameID INT NOT NULL,
    Rating INT NOT NULL,
    Comment TEXT,
    Created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_review_user FOREIGN KEY (UserID) REFERENCES User(UserID) ON DELETE CASCADE,
    CONSTRAINT fk_review_game FOREIGN KEY (GameID) REFERENCES Game(GameID) ON DELETE CASCADE,
    CONSTRAINT unique_user_game_review UNIQUE (UserID, GameID)
);

-- FAVORITE TABLE
CREATE TABLE Favorite (
    FavoriteID INT AUTO_INCREMENT PRIMARY KEY,
    UserID INT NOT NULL,
    GameID INT NOT NULL,
    Added_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_fav_user FOREIGN KEY (UserID) REFERENCES User(UserID) ON DELETE CASCADE,
    CONSTRAINT fk_fav_game FOREIGN KEY (GameID) REFERENCES Game(GameID) ON DELETE CASCADE,
    UNIQUE (UserID, GameID)
);

-- ===============================
-- ADVANCED FEATURE 1: VIEW
-- ===============================
CREATE OR REPLACE VIEW GameAverageRatings AS
SELECT g.GameID, g.Title, ROUND(AVG(r.Rating),2) AS AvgRating
FROM Game g
JOIN Review r ON g.GameID = r.GameID
GROUP BY g.GameID, g.Title;

-- ===============================
-- ADVANCED FEATURE 2: TRIGGER
-- ===============================
DELIMITER //
CREATE TRIGGER trg_check_rating
BEFORE INSERT ON Review
FOR EACH ROW
BEGIN
    IF NEW.Rating < 1 OR NEW.Rating > 10 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Rating must be between 1 and 10';
    END IF;
END//
DELIMITER ;
