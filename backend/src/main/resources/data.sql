-- Explicit local demo seed. Run with --spring.profiles.active=seed to reset the database.
TRUNCATE TABLE users CASCADE;

-- All test accounts use the password: password123
-- BCrypt hash (cost 10): $2a$10$lncCO7RiUFbe4cCEBkXdpeBJTFjAoHKlewgHW3kUhKsV9vouKOWrq

INSERT INTO users (name, email, phone, password, role, enabled, created_at, updated_at) VALUES
    ('Admin User', 'admin@test.com', '0900000001', '$2a$10$lncCO7RiUFbe4cCEBkXdpeBJTFjAoHKlewgHW3kUhKsV9vouKOWrq', 'ADMIN', true, NOW() - INTERVAL '90 days', NOW()),
    ('Support Agent', 'agent@test.com', '0900000002', '$2a$10$lncCO7RiUFbe4cCEBkXdpeBJTFjAoHKlewgHW3kUhKsV9vouKOWrq', 'ADMIN', true, NOW() - INTERVAL '88 days', NOW());

INSERT INTO users (name, email, phone, password, role, enabled, created_at, updated_at)
SELECT
    'Customer ' || LPAD(n::text, 2, '0'),
    'customer' || LPAD(n::text, 2, '0') || '@test.com',
    '09' || LPAD((10000000 + n)::text, 8, '0'),
    '$2a$10$lncCO7RiUFbe4cCEBkXdpeBJTFjAoHKlewgHW3kUhKsV9vouKOWrq',
    'CUSTOMER',
    true,
    NOW() - ((60 - n) || ' days')::interval,
    NOW()
FROM generate_series(1, 28) AS n;

WITH admin_user AS (
    SELECT id FROM users WHERE email = 'admin@test.com'
),
agent_user AS (
    SELECT id FROM users WHERE email = 'agent@test.com'
),
seed_rows AS (
    SELECT
        n,
        CASE
            WHEN n % 10 = 0 THEN 'RESOLVED'
            ELSE (ARRAY['PENDING', 'VALIDATING', 'RESOLVING', 'RESOLVED'])[((n - 1) % 4) + 1]
        END AS status,
        (n % 10 = 0) AS is_rejected,
        (ARRAY['PRODUCT', 'SERVICE', 'DELIVERY', 'BILLING', 'OTHER'])[((n - 1) % 5) + 1] AS category,
        (ARRAY['LOW', 'MEDIUM', 'HIGH', 'URGENT'])[((n - 1) % 4) + 1] AS priority,
        (ARRAY[
            'Missing item from package',
            'Wrong product delivered',
            'Package arrived damaged',
            'Delivery delayed past promise date',
            'Refund not received',
            'Support response was unclear',
            'Warranty request not processed',
            'Duplicate charge on card',
            'Courier marked delivered incorrectly',
            'Replacement item has not shipped'
        ])[((n - 1) % 10) + 1] AS title
    FROM generate_series(1, 50) AS n
)
INSERT INTO complaints (
    complaint_code, customer_id, title, description, order_id, phone,
    category, priority, status,
    validated_by, assigned_to, approved_by,
    investigation_summary, root_cause, resolution,
    created_at, updated_at, submitted_at,
    validated_at, assigned_at, resolved_at,
    edit_count, edit_deadline
)
SELECT
    'RC-' || TO_CHAR(CURRENT_DATE - (seed.n || ' days')::interval, 'YYYYMMDD') || '-' || LPAD(seed.n::text, 4, '0'),
    customer.id,
    seed.title,
    '[' || seed.category || ' Complaint]' || E'\n\n' ||
        'Demo complaint #' || seed.n || ' for order ORD-2026-' || LPAD((7000 + seed.n)::text, 4, '0') ||
        '. The customer reports that the issue affected their order experience and requests a review from support.',
    'ORD-2026-' || LPAD((7000 + seed.n)::text, 4, '0'),
    customer.phone,
    seed.category,
    CASE WHEN seed.status IN ('RESOLVING', 'RESOLVED') AND NOT seed.is_rejected THEN seed.priority ELSE NULL END,
    seed.status,
    CASE WHEN seed.status IN ('VALIDATING', 'RESOLVING', 'RESOLVED') THEN admin_user.id ELSE NULL END,
    CASE WHEN seed.status IN ('RESOLVING', 'RESOLVED') AND NOT seed.is_rejected THEN agent_user.id ELSE NULL END,
    CASE WHEN seed.status = 'RESOLVED' THEN admin_user.id ELSE NULL END,
    CASE
        WHEN seed.status IN ('RESOLVING', 'RESOLVED') AND NOT seed.is_rejected
            THEN 'Support reviewed order records, customer evidence, payment events, and delivery tracking for this complaint.'
        ELSE NULL
    END,
    CASE
        WHEN seed.status IN ('RESOLVING', 'RESOLVED') AND NOT seed.is_rejected
            THEN 'The issue was caused by an operational mismatch between order fulfillment data and downstream processing.'
        ELSE NULL
    END,
    CASE
        WHEN seed.is_rejected
            THEN 'Complaint was rejected during validation because it did not meet handling criteria.'
        WHEN seed.status = 'RESOLVING'
            THEN 'A proposed resolution has been prepared and is waiting for final customer communication.'
        WHEN seed.status = 'RESOLVED'
            THEN 'The customer was compensated or the order issue was corrected according to policy.'
        ELSE NULL
    END,
    NOW() - (seed.n || ' days')::interval,
    NOW() - (GREATEST(seed.n - 3, 0) || ' days')::interval,
    NOW() - (seed.n || ' days')::interval,
    CASE WHEN seed.status IN ('VALIDATING', 'RESOLVING', 'RESOLVED') THEN NOW() - (GREATEST(seed.n - 1, 0) || ' days')::interval ELSE NULL END,
    CASE WHEN seed.status IN ('RESOLVING', 'RESOLVED') AND NOT seed.is_rejected THEN NOW() - (GREATEST(seed.n - 2, 0) || ' days')::interval ELSE NULL END,
    CASE WHEN seed.status = 'RESOLVED' THEN NOW() - (GREATEST(seed.n - 4, 0) || ' days')::interval ELSE NULL END,
    0,
    NULL
FROM seed_rows seed
JOIN users customer
    ON customer.email = 'customer' || LPAD((((seed.n - 1) % 28) + 1)::text, 2, '0') || '@test.com'
CROSS JOIN admin_user
CROSS JOIN agent_user;

INSERT INTO complaint_validations (
    complaint_id, validated_by, validation_status,
    is_information_complete, is_within_scope,
    is_order_reference_valid, is_description_valid, is_evidence_valid,
    rejection_reason, missing_information, validation_notes, validated_at
)
SELECT
    complaints.id,
    admin_user.id,
    CASE WHEN complaints.resolution LIKE 'Complaint was rejected%' THEN 'INVALID' ELSE 'VALID' END,
    complaints.resolution NOT LIKE 'Complaint was rejected%',
    complaints.resolution NOT LIKE 'Complaint was rejected%',
    complaints.resolution NOT LIKE 'Complaint was rejected%',
    true,
    complaints.resolution NOT LIKE 'Complaint was rejected%',
    CASE
        WHEN complaints.resolution LIKE 'Complaint was rejected%'
            THEN 'Complaint is outside the supported policy scope for this demo workflow.'
        ELSE NULL
    END,
    NULL,
    CASE
        WHEN complaints.resolution LIKE 'Complaint was rejected%' THEN 'Validation completed with rejection.'
        ELSE 'Validation completed successfully.'
    END,
    COALESCE(complaints.validated_at, NOW())
FROM complaints
CROSS JOIN (SELECT id FROM users WHERE email = 'admin@test.com') AS admin_user
WHERE complaints.status IN ('RESOLVING', 'RESOLVED');
