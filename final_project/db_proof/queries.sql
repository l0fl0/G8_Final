-- ============================================================
-- GameVault — queries.sql
-- All application queries + advanced features
-- ============================================================

USE GamePlatformDB;

-- ────────────────────────────────────────────────────────────
-- Q1: All users
-- ────────────────────────────────────────────────────────────
SELECT UserID, Username, Email, AvatarURL, CreatedAt
FROM User
ORDER BY CreatedAt DESC;

-- ────────────────────────────────────────────────────────────
-- Q2: All games
-- ────────────────────────────────────────────────────────────
SELECT GameID, Title, Genre, Release_date, Developer
FROM Game
ORDER BY Release_date DESC;

-- ────────────────────────────────────────────────────────────
-- Q3: All reviews joined with Username and Game Title
-- ────────────────────────────────────────────────────────────
SELECT u.Username, g.Title, r.Rating, r.Comment, r.Created_At
FROM Review r
JOIN User u ON r.UserID = u.UserID
JOIN Game g ON r.GameID = g.GameID
ORDER BY r.Created_At DESC;

-- ────────────────────────────────────────────────────────────
-- Q4: Average rating per game (aggregation + GROUP BY)
-- ────────────────────────────────────────────────────────────
SELECT g.Title,
       ROUND(AVG(r.Rating), 2) AS AvgRating,
       COUNT(r.ReviewID)        AS TotalReviews
FROM Game g
JOIN Review r ON g.GameID = r.GameID
GROUP BY g.GameID, g.Title
ORDER BY AvgRating DESC;

-- ────────────────────────────────────────────────────────────
-- Q5: All favorites joined with Username and Game Title
-- ────────────────────────────────────────────────────────────
SELECT u.Username, g.Title, f.Added_At
FROM Favorite f
JOIN User u ON f.UserID = u.UserID
JOIN Game g ON f.GameID = g.GameID
ORDER BY f.Added_At DESC;

-- ────────────────────────────────────────────────────────────
-- Q6: Games with no reviews (subquery)
-- ────────────────────────────────────────────────────────────
SELECT GameID, Title, Genre
FROM Game
WHERE GameID NOT IN (SELECT GameID FROM Review);

-- ────────────────────────────────────────────────────────────
-- Q7: Review count per game (aggregation)
-- ────────────────────────────────────────────────────────────
SELECT g.Title, COUNT(r.ReviewID) AS TotalReviews
FROM Game g
LEFT JOIN Review r ON g.GameID = r.GameID
GROUP BY g.GameID, g.Title
ORDER BY TotalReviews DESC;

-- ────────────────────────────────────────────────────────────
-- Q8: Followers list for a user (JOIN on Followers table)
-- ────────────────────────────────────────────────────────────
SELECT u.Username AS Follower, f.FollowedAt
FROM Followers f
JOIN User u ON f.FollowerUserID = u.UserID
WHERE f.FollowedUserID = 1;

-- ────────────────────────────────────────────────────────────
-- Q9: Single game detail with average rating (LEFT JOIN)
-- ────────────────────────────────────────────────────────────
SELECT g.GameID, g.Title, g.Genre, g.Developer, g.Description,
       ROUND(AVG(r.Rating), 1) AS AverageRating,
       COUNT(r.ReviewID)        AS TotalReviews
FROM Game g
LEFT JOIN Review r ON g.GameID = r.GameID
WHERE g.GameID = 1
GROUP BY g.GameID;

-- ────────────────────────────────────────────────────────────
-- Q10: All users with follower + following + review counts
-- ────────────────────────────────────────────────────────────
SELECT
    u.UserID,
    u.Username,
    (SELECT COUNT(*) FROM Followers WHERE FollowedUserID  = u.UserID) AS Followers,
    (SELECT COUNT(*) FROM Followers WHERE FollowerUserID  = u.UserID) AS Following,
    (SELECT COUNT(*) FROM Review    WHERE UserID          = u.UserID) AS TotalReviews
FROM User u
ORDER BY u.CreatedAt DESC;

-- ────────────────────────────────────────────────────────────
-- ADVANCED FEATURE 1: Query the VIEW
-- vw_TopRatedGames pre-aggregates ratings across all games
-- ────────────────────────────────────────────────────────────
SELECT * FROM vw_TopRatedGames
WHERE TotalReviews > 0;

-- ────────────────────────────────────────────────────────────
-- ADVANCED FEATURE 2: TRIGGER (defined in schema.sql)
-- trg_validate_rating fires before every INSERT on Review
-- Test it fires correctly — this should fail:
-- INSERT INTO Review (UserID, GameID, Rating) VALUES (1, 3, 15);
-- ────────────────────────────────────────────────────────────

-- ────────────────────────────────────────────────────────────
-- ADVANCED FEATURE 3: Call the STORED PROCEDURE
-- Returns full profile summary for UserID = 1
-- ────────────────────────────────────────────────────────────
CALL sp_GetUserProfile(1);
