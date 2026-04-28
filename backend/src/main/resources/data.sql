-- ================================================
-- STEP 1: CLEAR ALL EXISTING DATA
-- ================================================
DELETE FROM users;

-- ================================================
-- STEP 2: INSERT TEST USERS
-- All passwords are BCrypt hash of "password123"
-- ================================================

-- CUSTOMERS (external users who submit complaints)
INSERT INTO users (name, email, password, role, enabled, created_at) VALUES
  ('Nguyen Van An',   'customer1@test.com',    '$2a$10$lncCO7RiUFbe4cCEBkXdpeBJTFjAoHKlewgHW3kUhKsV9vouKOWrq', 'CUSTOMER',   true, NOW());

INSERT INTO users (name, email, password, role, enabled, created_at) VALUES
  ('Tran Thi Bich',   'customer2@test.com',    '$2a$10$lncCO7RiUFbe4cCEBkXdpeBJTFjAoHKlewgHW3kUhKsV9vouKOWrq', 'CUSTOMER',   true, NOW());

INSERT INTO users (name, email, password, role, enabled, created_at) VALUES
  ('Le Minh Duc',     'customer3@test.com',    '$2a$10$lncCO7RiUFbe4cCEBkXdpeBJTFjAoHKlewgHW3kUhKsV9vouKOWrq', 'CUSTOMER',   true, NOW());

-- CS_STAFF (receives and validates complaints)
INSERT INTO users (name, email, password, role, enabled, created_at) VALUES
  ('Pham Thi Huong',  'staff1@test.com',       '$2a$10$lncCO7RiUFbe4cCEBkXdpeBJTFjAoHKlewgHW3kUhKsV9vouKOWrq', 'CS_STAFF',   true, NOW());

INSERT INTO users (name, email, password, role, enabled, created_at) VALUES
  ('Hoang Van Binh',  'staff2@test.com',       '$2a$10$lncCO7RiUFbe4cCEBkXdpeBJTFjAoHKlewgHW3kUhKsV9vouKOWrq', 'CS_STAFF',   true, NOW());

-- SPECIALIST (investigates complaints)
INSERT INTO users (name, email, password, role, enabled, created_at) VALUES
  ('Nguyen Thi Lan',  'specialist1@test.com',  '$2a$10$lncCO7RiUFbe4cCEBkXdpeBJTFjAoHKlewgHW3kUhKsV9vouKOWrq', 'SPECIALIST', true, NOW());

INSERT INTO users (name, email, password, role, enabled, created_at) VALUES
  ('Tran Van Cuong',  'specialist2@test.com',  '$2a$10$lncCO7RiUFbe4cCEBkXdpeBJTFjAoHKlewgHW3kUhKsV9vouKOWrq', 'SPECIALIST', true, NOW());

-- MANAGEMENT (approves resolutions)
INSERT INTO users (name, email, password, role, enabled, created_at) VALUES
  ('Le Thi Mai',      'manager1@test.com',     '$2a$10$lncCO7RiUFbe4cCEBkXdpeBJTFjAoHKlewgHW3kUhKsV9vouKOWrq', 'MANAGEMENT', true, NOW());
