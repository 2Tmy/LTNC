-- Explicit local demo seed. Run with --spring.profiles.active=seed to reset the database.
TRUNCATE TABLE users CASCADE;

-- All test accounts use the password: password123
-- BCrypt hash (cost 10): $2a$10$lncCO7RiUFbe4cCEBkXdpeBJTFjAoHKlewgHW3kUhKsV9vouKOWrq

INSERT INTO users (name, email, phone, password, role, enabled, created_at, updated_at) VALUES
    ('Admin User', 'admin@test.com', '0900000001', '$2a$10$lncCO7RiUFbe4cCEBkXdpeBJTFjAoHKlewgHW3kUhKsV9vouKOWrq', 'ADMIN', true, NOW() - INTERVAL '120 days', NOW());

WITH seed_window AS (
    SELECT
        (DATE_TRUNC('year', CURRENT_DATE)::date + INTERVAL '2 months') AS start_at,
        GREATEST(
            1,
            (CURRENT_DATE - (DATE_TRUNC('year', CURRENT_DATE)::date + INTERVAL '2 months')::date)
        ) AS span_days
)
INSERT INTO users (name, email, phone, password, role, enabled, created_at, updated_at)
SELECT
    'Customer ' || LPAD(n::text, 3, '0'),
    'customer' || LPAD(n::text, 3, '0') || '@gmail.com',
    '09' || LPAD((20000000 + n)::text, 8, '0'),
    '$2a$10$lncCO7RiUFbe4cCEBkXdpeBJTFjAoHKlewgHW3kUhKsV9vouKOWrq',
    'CUSTOMER',
    true,
    seed_window.start_at
        + (FLOOR(((n - 1) * seed_window.span_days::numeric) / 99)::int || ' days')::interval
        + (((n * 37) % 86400)::int || ' seconds')::interval,
    NOW()
FROM generate_series(1, 100) AS n
CROSS JOIN seed_window;

WITH admin_user AS (
    SELECT id FROM users WHERE email = 'admin@test.com'
),
seed_rows AS (
    SELECT
        n,
        seed_window.start_at
            + (FLOOR(((n - 1) * seed_window.span_days::numeric) / 99)::int || ' days')::interval
            + (((n * 53) % 86400)::int || ' seconds')::interval AS submitted_at,
        CASE
            WHEN n IN (1, 2, 4, 7, 11, 16, 22, 29, 37, 46, 56, 67, 79, 92) THEN 'PENDING'
            WHEN n IN (3, 5, 8, 12, 17, 23, 30, 38, 47, 57, 68, 80, 93) THEN 'VALIDATING'
            WHEN n IN (6, 9, 13, 18, 24, 31, 39, 48, 58, 69, 81, 94, 99) THEN 'RESOLVING'
            ELSE 'RESOLVED'
        END AS status,
        (n IN (10, 20, 33, 45, 59, 72, 86, 97)) AS is_rejected,
        CASE
            WHEN n % 10 IN (1, 2, 3, 4) THEN 'DELIVERY'
            WHEN n % 10 IN (5, 6) THEN 'PRODUCT'
            WHEN n % 10 = 7 THEN 'SERVICE'
            WHEN n % 10 IN (8, 9) THEN 'BILLING'
            ELSE 'OTHER'
        END AS category,
        CASE
            WHEN n % 17 = 0 THEN 'URGENT'
            WHEN n % 5 = 0 THEN 'HIGH'
            WHEN n % 3 = 0 THEN 'MEDIUM'
            ELSE 'LOW'
        END AS priority,
        (ARRAY[
            'Package arrived damaged',
            'Delivery delayed past promise date',
            'Courier marked delivered incorrectly',
            'Missing item from package',
            'Wrong product delivered',
            'Replacement item has not shipped',
            'Support response was unclear',
            'Duplicate charge on card',
            'Refund not received',
            'Warranty request not processed',
            'Payment confirmation missing',
            'Delivery address was changed incorrectly'
        ])[((n - 1) % 12) + 1] AS title,
        (((n * 37) % 85) + 1) AS customer_number
    FROM generate_series(1, 100) AS n
    CROSS JOIN (
        SELECT
            (DATE_TRUNC('year', CURRENT_DATE)::date + INTERVAL '2 months') AS start_at,
            GREATEST(
                1,
                (CURRENT_DATE - (DATE_TRUNC('year', CURRENT_DATE)::date + INTERVAL '2 months')::date)
            ) AS span_days
    ) AS seed_window
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
        'Demo complaint #' || seed.n || ' for order ORD-2026-' || LPAD((8000 + seed.n)::text, 4, '0') ||
        '. The customer reports an issue that affected their order experience and requests support review.',
    'ORD-2026-' || LPAD((8000 + seed.n)::text, 4, '0'),
    customer.phone,
    seed.category,
    CASE WHEN seed.status IN ('RESOLVING', 'RESOLVED') AND NOT seed.is_rejected THEN seed.priority ELSE NULL END,
    seed.status,
    CASE WHEN seed.status IN ('VALIDATING', 'RESOLVING', 'RESOLVED') THEN admin_user.id ELSE NULL END,
    CASE WHEN seed.status IN ('RESOLVING', 'RESOLVED') AND NOT seed.is_rejected THEN admin_user.id ELSE NULL END,
    CASE WHEN seed.status = 'RESOLVED' THEN admin_user.id ELSE NULL END,
    NULL,
    CASE
        WHEN seed.status IN ('RESOLVING', 'RESOLVED') AND NOT seed.is_rejected
            THEN 'The issue was caused by a mismatch between order records, fulfillment handling, or payment processing.'
        ELSE NULL
    END,
    CASE
        WHEN seed.is_rejected
            THEN 'Complaint was rejected during validation because it did not meet handling criteria.'
        WHEN seed.status = 'RESOLVING'
            THEN 'Support identified the root cause and is preparing the final customer response.'
        WHEN seed.status = 'RESOLVED'
            THEN 'The customer received a corrective action, refund, replacement, or documented explanation according to policy.'
        ELSE NULL
    END,
    seed.submitted_at,
    LEAST(seed.submitted_at + ((seed.n % 6) || ' days')::interval, NOW()),
    seed.submitted_at,
    CASE
        WHEN seed.status IN ('VALIDATING', 'RESOLVING', 'RESOLVED')
            THEN LEAST(seed.submitted_at + INTERVAL '1 day', NOW())
        ELSE NULL
    END,
    CASE
        WHEN seed.status IN ('RESOLVING', 'RESOLVED') AND NOT seed.is_rejected
            THEN LEAST(seed.submitted_at + INTERVAL '2 days', NOW())
        ELSE NULL
    END,
    CASE
        WHEN seed.status = 'RESOLVED'
            THEN LEAST(seed.submitted_at + ((3 + (seed.n % 10)) || ' days')::interval, NOW())
        ELSE NULL
    END,
    0,
    NULL
FROM seed_rows seed
JOIN users customer
    ON customer.email = 'customer' || LPAD(seed.customer_number::text, 3, '0') || '@gmail.com'
CROSS JOIN admin_user;

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
