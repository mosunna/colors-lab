-- Test database for the API integration tests (used only in CI / local testing).
-- Mirrors the production COLORS schema described in README.md.

CREATE TABLE IF NOT EXISTS Users (
  ID INT NOT NULL AUTO_INCREMENT,
  FirstName VARCHAR(50) NOT NULL DEFAULT '',
  LastName VARCHAR(50) NOT NULL DEFAULT '',
  Login VARCHAR(50) NOT NULL DEFAULT '',
  Password VARCHAR(50) NOT NULL DEFAULT '',
  PRIMARY KEY (ID)
);

CREATE TABLE IF NOT EXISTS Colors (
  ID INT NOT NULL AUTO_INCREMENT,
  Name VARCHAR(50) NOT NULL DEFAULT '',
  UserID INT NOT NULL DEFAULT 0,
  PRIMARY KEY (ID)
);

-- Test user. Password is the MD5 hash of "testpass".
INSERT INTO Users (FirstName, LastName, Login, Password)
VALUES ('Test', 'User', 'testuser', MD5('testpass'));

INSERT INTO Colors (Name, UserID) VALUES
  ('Red', 1),
  ('Dark Red', 1),
  ('Blue', 1);
