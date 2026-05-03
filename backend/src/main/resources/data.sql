-- ================================================
-- DATA.SQL - SEED DATA FOR TESTING
-- ================================================
-- 6 users: 4 roles + 2 extra customers
-- 3 complaints: VALIDATED, NEED_MORE_INFO, SUBMITTED
-- Related: validations, attachments, histories, notifications, comments
-- ================================================

-- ==================== USERS ====================
-- Password for all: password123
-- BCrypt hash: $2a$10$rJY8Z9QhjNBZNGz3vBvyRO6Zb0qJQKZ5k9VH5yPGmYBJz3pQ7qKHO

INSERT INTO users (name, email, password, role, enabled, created_at, updated_at) VALUES
('Nguyen Van An', 'customer@test.com', '$2a$10$rJY8Z9QhjNBZNGz3vBvyRO6Zb0qJQKZ5k9VH5yPGmYBJz3pQ7qKHO', 'CUSTOMER', true, NOW(), NOW()),
('Tran Thi Binh', 'staff@test.com', '$2a$10$rJY8Z9QhjNBZNGz3vBvyRO6Zb0qJQKZ5k9VH5yPGmYBJz3pQ7qKHO', 'CS_STAFF', true, NOW(), NOW()),
('Le Van Cuong', 'specialist@test.com', '$2a$10$rJY8Z9QhjNBZNGz3vBvyRO6Zb0qJQKZ5k9VH5yPGmYBJz3pQ7qKHO', 'SPECIALIST', true, NOW(), NOW()),
('Pham Thi Dung', 'manager@test.com', '$2a$10$rJY8Z9QhjNBZNGz3vBvyRO6Zb0qJQKZ5k9VH5yPGmYBJz3pQ7qKHO', 'MANAGEMENT', true, NOW(), NOW()),
('Hoang Van Binh', 'customer2@test.com', '$2a$10$rJY8Z9QhjNBZNGz3vBvyRO6Zb0qJQKZ5k9VH5yPGmYBJz3pQ7qKHO', 'CUSTOMER', true, NOW(), NOW()),
('Do Thi Chau', 'customer3@test.com', '$2a$10$rJY8Z9QhjNBZNGz3vBvyRO6Zb0qJQKZ5k9VH5yPGmYBJz3pQ7qKHO', 'CUSTOMER', true, NOW(), NOW());

-- ==================== COMPLAINTS ====================

-- Complaint 1: VALIDATED (from customer@test.com)
INSERT INTO complaints (
    customer_id, title, description, category, priority, status,
    edit_count, validated_by, validated_at,
    created_at, updated_at, submitted_at
) VALUES (
    1,
    'Sản phẩm bị lỗi khi nhận hàng',
    'Laptop Dell Inspiron 15 bị vỡ màn hình. Serial: ABC123456. Có ảnh đính kèm.',
    'PRODUCT', 'HIGH', 'VALIDATED',
    0, 2, NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '3 days', NOW() - INTERVAL '1 day', NOW() - INTERVAL '3 days'
);

-- Complaint 2: NEED_MORE_INFO (from customer2@test.com)
INSERT INTO complaints (
    customer_id, title, description, category, priority, status,
    edit_count, edit_deadline, validated_by, validated_at,
    created_at, updated_at, submitted_at
) VALUES (
    5,
    'Dịch vụ giao hàng chậm',
    'Đơn hàng đã 5 ngày chưa nhận được.',
    'DELIVERY', 'MEDIUM', 'NEED_MORE_INFO',
    0, NOW() + INTERVAL '7 days', 2, NOW() - INTERVAL '2 hours',
    NOW() - INTERVAL '1 day', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '1 day'
);

-- Complaint 3: SUBMITTED (from customer3@test.com)
INSERT INTO complaints (
    customer_id, title, description, category, priority, status,
    edit_count, created_at, updated_at, submitted_at
) VALUES (
    6,
    'Hóa đơn bị tính sai giá',
    'Giá ưu đãi 500k nhưng hóa đơn ghi 700k.',
    'BILLING', 'LOW', 'SUBMITTED',
    0, NOW() - INTERVAL '2 hours', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '2 hours'
);

-- ==================== VALIDATIONS ====================

INSERT INTO complaint_validations (
    complaint_id, validated_by, validation_status,
    is_information_complete, is_within_scope,
    validation_notes, validated_at
) VALUES
(1, 2, 'VALID', true, true, 'Thông tin đầy đủ, có ảnh minh chứng', NOW() - INTERVAL '1 day'),
(2, 2, 'NEED_MORE_INFO', false, true, 'Thiếu thông tin tra cứu', NOW() - INTERVAL '2 hours');

-- Update missing_information for complaint 2
UPDATE complaint_validations 
SET missing_information = 'Vui lòng cung cấp: 1) Mã đơn hàng 2) Ảnh biên nhận 3) SĐT vận chuyển'
WHERE complaint_id = 2;

-- ==================== ATTACHMENTS ====================

INSERT INTO complaint_attachments (
    complaint_id, uploaded_by, file_name, file_type, file_size, file_path,
    is_evidence, is_initial_upload, uploaded_at
) VALUES
(1, 1, 'man-hinh-vo.jpg', 'image/jpeg', 2048576, '/uploads/2024/05/abc123.jpg', true, true, NOW() - INTERVAL '3 days'),
(1, 1, 'serial.jpg', 'image/jpeg', 1024000, '/uploads/2024/05/abc124.jpg', true, true, NOW() - INTERVAL '3 days');

-- ==================== HISTORIES ====================

-- Complaint 1 history
INSERT INTO complaint_histories (complaint_id, changed_by, action_type, old_status, new_status, reason, changed_at) VALUES
(1, 1, 'STATUS_CHANGED', NULL, 'SUBMITTED', 'Created', NOW() - INTERVAL '3 days'),
(1, 2, 'STATUS_CHANGED', 'SUBMITTED', 'PENDING_VALIDATION', 'Validation started', NOW() - INTERVAL '1 day 2 hours'),
(1, 2, 'STATUS_CHANGED', 'PENDING_VALIDATION', 'VALIDATED', 'Validated', NOW() - INTERVAL '1 day');

-- Complaint 2 history
INSERT INTO complaint_histories (complaint_id, changed_by, action_type, old_status, new_status, reason, changed_at) VALUES
(2, 5, 'STATUS_CHANGED', NULL, 'SUBMITTED', 'Created', NOW() - INTERVAL '1 day'),
(2, 2, 'STATUS_CHANGED', 'SUBMITTED', 'PENDING_VALIDATION', 'Validation started', NOW() - INTERVAL '4 hours'),
(2, 2, 'STATUS_CHANGED', 'PENDING_VALIDATION', 'NEED_MORE_INFO', 'Missing info', NOW() - INTERVAL '2 hours');

-- Complaint 3 history
INSERT INTO complaint_histories (complaint_id, changed_by, action_type, old_status, new_status, reason, changed_at) VALUES
(3, 6, 'STATUS_CHANGED', NULL, 'SUBMITTED', 'Created', NOW() - INTERVAL '2 hours');

-- ==================== NOTIFICATIONS ====================

-- Customer 1 notifications
INSERT INTO notifications (user_id, complaint_id, title, message, type, action_url, is_read, read_at, created_at) VALUES
(1, 1, 'Complaint Received', 'Your complaint has been received', 'COMPLAINT_RECEIVED', '/customer/complaints/1', true, NOW() - INTERVAL '2 days', NOW() - INTERVAL '3 days'),
(1, 1, 'Complaint Validated', 'Your complaint is validated', 'VALIDATION_VALID', '/customer/complaints/1', true, NOW() - INTERVAL '12 hours', NOW() - INTERVAL '1 day');

-- Customer 2 notifications
INSERT INTO notifications (user_id, complaint_id, title, message, type, action_url, is_read, created_at) VALUES
(5, 2, 'Complaint Received', 'Received', 'COMPLAINT_RECEIVED', '/customer/complaints/2', true, NOW() - INTERVAL '1 day'),
(5, 2, 'More Info Required', 'Please update. 7 days deadline', 'VALIDATION_NEED_INFO', '/customer/complaints/2', false, NOW() - INTERVAL '2 hours');

-- Customer 3 notifications
INSERT INTO notifications (user_id, complaint_id, title, message, type, action_url, is_read, created_at) VALUES
(6, 3, 'Complaint Received', 'Received', 'COMPLAINT_RECEIVED', '/customer/complaints/3', false, NOW() - INTERVAL '2 hours');

-- ==================== COMMENTS ====================

INSERT INTO complaint_comments (complaint_id, user_id, comment_text, is_internal, created_at) VALUES
(1, 2, 'Confirmed product defect. Forwarding to technical team.', true, NOW() - INTERVAL '1 day'),
(1, 1, 'Thank you for quick response', false, NOW() - INTERVAL '20 hours');