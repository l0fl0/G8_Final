USE game_review;

-- Q1
SELECT * FROM User;

-- Q2
SELECT * FROM Game;

-- Q3 (JOIN)
SELECT u.Username, g.Title, r.Rating, r.Comment
FROM Review r
JOIN User u ON r.UserID = u.UserID
JOIN Game g ON r.GameID = g.GameID;

-- Q4 (AVG)
SELECT g.Title, AVG(r.Rating) AS AvgRating
FROM Game g
JOIN Review r ON g.GameID = r.GameID
GROUP BY g.GameID;

-- Q5
SELECT * FROM Favorite;

-- Q6 (JOIN)
SELECT u.Username, g.Title
FROM Favorite f
JOIN User u ON f.UserID = u.UserID
JOIN Game g ON f.GameID = g.GameID;

-- Q7 (VIEW)
SELECT * FROM GameAverageRatings;

-- Q8 (SUBQUERY)
SELECT Title FROM Game WHERE GameID NOT IN (SELECT GameID FROM Review);

-- Q9 (COUNT)
SELECT GameID, COUNT(*) AS TotalReviews FROM Review GROUP BY GameID;
