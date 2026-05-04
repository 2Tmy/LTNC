-- ================================================
-- STEP 1: CLEAR ALL EXISTING DATA
-- TRUNCATE users CASCADE removes complaints and all child tables automatically
-- because every child table uses ON DELETE CASCADE back to users or complaints.
-- ================================================
TRUNCATE TABLE users CASCADE;

-- ================================================
-- STEP 2: INSERT TEST USERS
-- All passwords are BCrypt hash of "password123"
-- ================================================

-- CUSTOMERS (external users who submit complaints)
INSERT INTO users (name, email, password, role, enabled, created_at, updated_at) VALUES
  ('Nguyen Van An',  'customer1@test.com',   '$2a$10$lncCO7RiUFbe4cCEBkXdpeBJTFjAoHKlewgHW3kUhKsV9vouKOWrq', 'CUSTOMER',   true, NOW(), NOW()),
  ('Tran Thi Bich',  'customer2@test.com',   '$2a$10$lncCO7RiUFbe4cCEBkXdpeBJTFjAoHKlewgHW3kUhKsV9vouKOWrq', 'CUSTOMER',   true, NOW(), NOW()),
  ('Le Minh Duc',    'customer3@test.com',   '$2a$10$lncCO7RiUFbe4cCEBkXdpeBJTFjAoHKlewgHW3kUhKsV9vouKOWrq', 'CUSTOMER',   true, NOW(), NOW()),
  ('Alex Johnson',   'my@gmail.com',         '$2a$10$lncCO7RiUFbe4cCEBkXdpeBJTFjAoHKlewgHW3kUhKsV9vouKOWrq', 'CUSTOMER',   true, NOW(), NOW()),

-- CS_STAFF (validates and routes complaints)
  ('Pham Thi Huong', 'staff1@test.com',      '$2a$10$lncCO7RiUFbe4cCEBkXdpeBJTFjAoHKlewgHW3kUhKsV9vouKOWrq', 'CS_STAFF',   true, NOW(), NOW()),
  ('Hoang Van Binh', 'staff2@test.com',      '$2a$10$lncCO7RiUFbe4cCEBkXdpeBJTFjAoHKlewgHW3kUhKsV9vouKOWrq', 'CS_STAFF',   true, NOW(), NOW()),

-- SPECIALIST (investigates and resolves complaints)
  ('Nguyen Thi Lan', 'specialist1@test.com', '$2a$10$lncCO7RiUFbe4cCEBkXdpeBJTFjAoHKlewgHW3kUhKsV9vouKOWrq', 'SPECIALIST', true, NOW(), NOW()),
  ('Tran Van Cuong', 'specialist2@test.com', '$2a$10$lncCO7RiUFbe4cCEBkXdpeBJTFjAoHKlewgHW3kUhKsV9vouKOWrq', 'SPECIALIST', true, NOW(), NOW()),

-- MANAGEMENT (approves resolutions)
  ('Le Thi Mai',     'manager1@test.com',    '$2a$10$lncCO7RiUFbe4cCEBkXdpeBJTFjAoHKlewgHW3kUhKsV9vouKOWrq', 'MANAGEMENT', true, NOW(), NOW()),
  ('Admin User',     'admin@gmail.com',      '$2a$10$lncCO7RiUFbe4cCEBkXdpeBJTFjAoHKlewgHW3kUhKsV9vouKOWrq', 'MANAGEMENT', true, NOW(), NOW());
