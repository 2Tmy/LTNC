-- ================================================
-- TEST QUERIES - For Manual Testing
-- ================================================

-- ==================== TEST 1: Basic User Queries ====================
-- Lấy tất cả users
SELECT id, name, email, role, enabled, created_at 
FROM users 
ORDER BY id;

-- Tìm user theo role
SELECT id, name, email, role 
FROM users 
WHERE role = 'CUSTOMER';

SELECT id, name, email, role 
FROM users 
WHERE role = 'CS_STAFF';

-- ==================== TEST 2: Complaint Queries ====================
-- Lấy complaint với thông tin customer
SELECT 
    c.id,
    c.title,
    c.description,
    c.category,
    c.priority,
    c.status,
    u.name as customer_name,
    u.email as customer_email,
    u.role as customer_role,
    c.created_at
FROM complaints c
INNER JOIN users u ON c.customer_id = u.id
ORDER BY c.created_at DESC;

-- Lấy complaint với validator info
SELECT 
    c.id,
    c.title,
    c.status,
    customer.name as customer_name,
    validator.name as validated_by_name,
    validator.role as validator_role,
    c.validated_at
FROM complaints c
INNER JOIN users customer ON c.customer_id = customer.id
LEFT JOIN users validator ON c.validated_by = validator.id
WHERE c.validated_by IS NOT NULL;

-- ==================== TEST 3: Validation Queries ====================
-- Lấy validation details với user info
SELECT 
    cv.id,
    cv.complaint_id,
    c.title as complaint_title,
    cv.validation_status,
    cv.is_information_complete,
    cv.is_within_scope,
    u.name as validated_by_name,
    u.role as validator_role,
    cv.validation_notes,
    cv.validated_at
FROM complaint_validations cv
INNER JOIN complaints c ON cv.complaint_id = c.id
INNER JOIN users u ON cv.validated_by = u.id;

-- ==================== TEST 4: Status History Queries ====================
-- Lấy lịch sử thay đổi status của 1 complaint
SELECT 
    csh.id,
    csh.old_status,
    csh.new_status,
    csh.reason,
    u.name as changed_by_name,
    u.role as changed_by_role,
    csh.changed_at
FROM complaint_status_history csh
INNER JOIN users u ON csh.changed_by = u.id
WHERE csh.complaint_id = 1
ORDER BY csh.changed_at;

-- ==================== TEST 5: Notification Queries ====================
-- Lấy notifications của 1 user (customer)
SELECT 
    n.id,
    n.title,
    n.message,
    n.type,
    n.is_read,
    n.read_at,
    c.title as complaint_title,
    n.created_at
FROM notifications n
LEFT JOIN complaints c ON n.complaint_id = c.id
WHERE n.user_id = 1  -- customer@test.com
ORDER BY n.created_at DESC;

-- Đếm unread notifications
SELECT 
    user_id,
    u.name as user_name,
    COUNT(*) as unread_count
FROM notifications n
INNER JOIN users u ON n.user_id = u.id
WHERE n.is_read = false
GROUP BY user_id, u.name;

-- ==================== TEST 6: Comment Queries ====================
-- Lấy comments của 1 complaint
SELECT 
    cc.id,
    cc.comment_text,
    cc.is_internal,
    u.name as commenter_name,
    u.role as commenter_role,
    cc.created_at
FROM complaint_comments cc
INNER JOIN users u ON cc.user_id = u.id
WHERE cc.complaint_id = 1
ORDER BY cc.created_at;

-- Lấy internal vs public comments
SELECT 
    'Internal Comments' as type,
    COUNT(*) as count
FROM complaint_comments
WHERE is_internal = true
UNION ALL
SELECT 
    'Public Comments',
    COUNT(*)
FROM complaint_comments
WHERE is_internal = false;

-- ==================== TEST 7: Complex JOIN Queries ====================
-- Full complaint info với tất cả relationships
SELECT 
    c.id,
    c.title,
    c.status,
    c.category,
    c.priority,
    customer.name as customer_name,
    customer.email as customer_email,
    validator.name as validated_by,
    specialist.name as assigned_to,
    manager.name as approved_by,
    c.created_at,
    c.validated_at,
    c.resolved_at
FROM complaints c
INNER JOIN users customer ON c.customer_id = customer.id
LEFT JOIN users validator ON c.validated_by = validator.id
LEFT JOIN users specialist ON c.assigned_to = specialist.id
LEFT JOIN users manager ON c.approved_by = manager.id;

-- ==================== TEST 8: Statistics Queries ====================
-- Count by role
SELECT 
    role,
    COUNT(*) as count,
    COUNT(*) FILTER (WHERE enabled = true) as enabled_count
FROM users
GROUP BY role
ORDER BY role;

-- Count by status
SELECT 
    status,
    COUNT(*) as count
FROM complaints
GROUP BY status
ORDER BY 
    CASE status
        WHEN 'SUBMITTED' THEN 1
        WHEN 'PENDING_VALIDATION' THEN 2
        WHEN 'VALIDATED' THEN 3
        WHEN 'REJECTED' THEN 4
        WHEN 'NEED_MORE_INFO' THEN 5
        WHEN 'IN_REVIEW' THEN 6
        WHEN 'INVESTIGATING' THEN 7
        WHEN 'RESOLVED' THEN 8
        WHEN 'CLOSED' THEN 9
    END;

-- Count by validation status
SELECT 
    validation_status,
    COUNT(*) as count
FROM complaint_validations
GROUP BY validation_status;

-- ==================== TEST 9: Business Logic Queries ====================
-- Find complaints pending validation (for CS_STAFF dashboard)
SELECT 
    c.id,
    c.title,
    c.status,
    customer.name as customer_name,
    c.submitted_at,
    EXTRACT(EPOCH FROM (NOW() - c.submitted_at)) / 3600 as hours_waiting
FROM complaints c
INNER JOIN users customer ON c.customer_id = customer.id
WHERE c.status IN ('SUBMITTED', 'PENDING_VALIDATION')
ORDER BY c.submitted_at;

-- Find complaints validated by a specific staff
SELECT 
    c.id,
    c.title,
    c.status,
    cv.validation_status,
    c.validated_at
FROM complaints c
INNER JOIN complaint_validations cv ON c.id = cv.complaint_id
WHERE cv.validated_by = 2  -- staff@test.com
ORDER BY c.validated_at DESC;

-- ==================== TEST 10: Performance Test ====================
-- Explain query plan
EXPLAIN ANALYZE
SELECT 
    c.id,
    c.title,
    customer.name,
    c.status
FROM complaints c
INNER JOIN users customer ON c.customer_id = customer.id
WHERE c.status = 'VALIDATED';

-- Check indexes
SELECT 
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;