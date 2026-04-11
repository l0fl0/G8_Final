USE GamePlatformDB;

-- TEST 1: Duplicate review (should fail)
INSERT INTO Review (UserID, GameID, Rating) VALUES (1,1,5);
-- Expected: Duplicate entry for UNIQUE(UserID, GameID)

-- TEST 2: Invalid foreign key (should fail)
INSERT INTO Review (UserID, GameID, Rating) VALUES (999,1,6);
-- Expected: Foreign key constraint fails

-- TEST 3: Trigger validation (should fail)
INSERT INTO Review (UserID, GameID, Rating) VALUES (1,2,15);
-- Expected: Rating must be between 1 and 10
