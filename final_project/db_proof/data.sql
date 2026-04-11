-- ============================================================
-- GameVault — data.sql
-- Sample data including NULL values and boundary values
-- Run AFTER schema.sql
-- ============================================================

USE GamePlatformDB;

-- ── USERS ────────────────────────────────────────────────────
-- AvatarURL is NULL for some users (nullable column test)
-- PasswordHash values are bcrypt hashes of 'password123'
INSERT INTO User (Username, Email, PasswordHash, AvatarURL) VALUES
('ali_g',    'ali@email.com',    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'https://placehold.co/80x80/1a1a2e/ffffff?text=AG'),
('sara_m',   'sara@email.com',   '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NULL),
('john_d',   'john@email.com',   '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NULL),
('mike_t',   'mike@email.com',   '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'https://placehold.co/80x80/1a1a2e/ffffff?text=MT'),
('guest_u',  'guest@email.com',  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NULL);

-- All seed users have password: password123
-- Use these credentials to log in during testing

-- ── GAMES ────────────────────────────────────────────────────
-- Some fields NULL to test nullable columns (Publisher, specs)
INSERT INTO Game (Title, Genre, Release_date, Developer, Publisher, Description, Cover_image, Minimum_specs, Recommended_specs) VALUES
('Elden Ring',     'Action RPG',    '2022-02-25', 'FromSoftware',  'Bandai Namco',
 'An open-world action RPG set in the Lands Between.',
 'https://placehold.co/300x400/1a1a2e/ffffff?text=Elden+Ring',
 'CPU: i5-8600K, RAM: 12GB, GPU: GTX 1060',
 'CPU: i7-8700K, RAM: 16GB, GPU: RTX 2080'),

('FIFA 24',        'Sports',        '2023-09-29', 'EA Sports',     'EA Sports',
 'The worlds most popular football simulation game.',
 'https://placehold.co/300x400/1a1a2e/ffffff?text=FIFA+24',
 'CPU: Core i5, RAM: 8GB, GPU: GTX 1050',
 'CPU: Core i7, RAM: 12GB, GPU: RTX 2060'),

('God of War',     'Action',        '2018-04-20', 'Santa Monica',  'Sony Interactive',
 'Kratos and his son Atreus journey through Norse mythology.',
 'https://placehold.co/300x400/1a1a2e/ffffff?text=God+of+War',
 'CPU: Core i5, RAM: 8GB, GPU: GTX 1060',
 'CPU: Core i7, RAM: 16GB, GPU: RTX 2070'),

('Minecraft',      'Sandbox',       '2011-11-18', 'Mojang',        'Mojang',
 'Build and explore infinite procedurally generated worlds.',
 'https://placehold.co/300x400/1a1a2e/ffffff?text=Minecraft',
 'CPU: Core i3, RAM: 4GB, GPU: Intel HD',
 'CPU: Core i5, RAM: 8GB, GPU: GTX 1050'),

('Untitled Demo',  NULL,            NULL,          NULL,            NULL,
 NULL, NULL, NULL, NULL);

-- ── REVIEWS ──────────────────────────────────────────────────
-- Rating 1 = minimum boundary, Rating 10 = maximum boundary
-- Comment NULL is allowed
INSERT INTO Review (UserID, GameID, Rating, Comment) VALUES
(1, 1, 9,  'Excellent gameplay, brutal but fair.'),
(2, 1, 8,  'Very challenging and rewarding.'),
(3, 2, 7,  'Fun experience with friends.'),
(4, 3, 10, 'An absolute masterpiece.'),        -- Rating 10: max boundary
(1, 2, 1,  'Not my type of game at all.'),     -- Rating 1: min boundary
(2, 3, 6,  NULL),                              -- NULL comment: allowed
(3, 4, 8,  'Creative and relaxing.');

-- ── FAVORITES ────────────────────────────────────────────────
INSERT INTO Favorite (UserID, GameID) VALUES
(1, 1), (1, 3),
(2, 1), (2, 4),
(3, 2), (4, 3),
(5, 4);

-- ── FOLLOWERS ────────────────────────────────────────────────
INSERT INTO Followers (FollowerUserID, FollowedUserID) VALUES
(1, 2), (1, 3),
(2, 3), (3, 4),
(4, 1), (5, 2);
