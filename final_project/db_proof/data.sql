USE game_review;

-- USERS
INSERT INTO User (Username, Email) VALUES
('Ali','ali@email.com'),
('Sara','sara@email.com'),
('John','john@email.com'),
('Mike','mike@email.com');

-- GAMES
INSERT INTO Game (Title, Genre) VALUES
('Elden Ring','RPG'),
('FIFA 24','Sports'),
('God of War','Action'),
('Minecraft','Sandbox');

-- REVIEWS (includes boundary values)
INSERT INTO Review (UserID, GameID, Rating, Comment) VALUES
(1,1,9,'Excellent gameplay'),
(2,1,8,'Very challenging'),
(3,2,7,'Fun experience'),
(4,3,10,'Masterpiece'),
(1,2,1,'Not my type');

-- FAVORITES
INSERT INTO Favorite (UserID, GameID) VALUES
(1,1),(2,1),(3,2),(4,3);

-- NULL example (allowed comment)
INSERT INTO Review (UserID, GameID, Rating, Comment) VALUES
(2,3,6,NULL);
