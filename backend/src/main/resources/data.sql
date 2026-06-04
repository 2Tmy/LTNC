-- Explicit local demo seed. Run with --spring.profiles.active=seed to reset the database.
TRUNCATE TABLE users CASCADE;

-- All test accounts use the password: password123
-- BCrypt hash (cost 10): $2a$10$lncCO7RiUFbe4cCEBkXdpeBJTFjAoHKlewgHW3kUhKsV9vouKOWrq

WITH seed_window AS (
    SELECT
        (DATE_TRUNC('year', CURRENT_DATE)::date + INTERVAL '2 months') AS start_at,
        GREATEST(
            (CURRENT_DATE - (DATE_TRUNC('year', CURRENT_DATE)::date + INTERVAL '2 months')::date),
            1
        ) AS span_days
)
INSERT INTO users (name, email, phone, password, role, enabled, created_at, updated_at)
SELECT
    'Admin User',
    'admin@test.com',
    '0900000001',
    '$2a$10$lncCO7RiUFbe4cCEBkXdpeBJTFjAoHKlewgHW3kUhKsV9vouKOWrq',
    'ADMIN',
    true,
    start_at,
    NOW()
FROM seed_window;

WITH seed_window AS (
    SELECT
        (DATE_TRUNC('year', CURRENT_DATE)::date + INTERVAL '2 months') AS start_at,
        GREATEST(
            (CURRENT_DATE - (DATE_TRUNC('year', CURRENT_DATE)::date + INTERVAL '2 months')::date),
            1
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
    start_at + (FLOOR(((n - 1) * span_days)::numeric / 99)::int || ' days')::interval,
    NOW()
FROM generate_series(1, 100) AS n
CROSS JOIN seed_window;

WITH seed_window AS (
    SELECT
        (DATE_TRUNC('year', CURRENT_DATE)::date + INTERVAL '2 months') AS start_at,
        GREATEST(
            (CURRENT_DATE - (DATE_TRUNC('year', CURRENT_DATE)::date + INTERVAL '2 months')::date),
            1
        ) AS span_days
),
admin_user AS (
    SELECT id FROM users WHERE email = 'admin@test.com'
),
seed_rows AS (
    SELECT
        n,
        CASE
            WHEN n <= 68 THEN
                start_at + (FLOOR(((n - 1) * span_days)::numeric / 99)::int || ' days')::interval
            WHEN n <= 76 THEN
                CURRENT_DATE - ((16 + ((n - 69) % 6)) || ' days')::interval
            WHEN n <= 84 THEN
                CURRENT_DATE - ((12 + ((n - 77) % 2)) || ' days')::interval
            ELSE
                CURRENT_DATE - (((n - 85) % 8) || ' days')::interval
        END + (((n * 17) % 9) || ' hours')::interval AS submitted_time,
        CASE
            WHEN n <= 68 THEN 'RESOLVED'
            WHEN n <= 80 THEN 'RESOLVING'
            WHEN n <= 90 THEN 'VALIDATING'
            ELSE 'PENDING'
        END AS status,
        n IN (10, 18, 26, 34, 42, 50, 58, 66) AS is_rejected,
        CASE
            WHEN n % 10 IN (1, 2, 3, 4) THEN 'DELIVERY'
            WHEN n % 10 IN (5, 6) THEN 'PRODUCT'
            WHEN n % 10 IN (7, 8) THEN 'BILLING'
            WHEN n % 10 = 9 THEN 'SERVICE'
            ELSE 'OTHER'
        END AS category,
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
            'Replacement item has not shipped',
            'Invoice information is incorrect',
            'Account support request delayed',
            'Promotion code was not applied',
            'Return pickup was missed',
            'Product quality does not match description'
        ])[((n - 1) % 15) + 1] AS title,
        (((n * 37) % 80) + 1) AS customer_number
    FROM generate_series(1, 100) AS n
    CROSS JOIN seed_window
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
    'RC-' || TO_CHAR(seed.submitted_time, 'YYYYMMDD') || '-' || LPAD(seed.n::text, 4, '0'),
    customer.id,
    seed.title,
    '[' || seed.category || ' Complaint]' || E'\n\n' ||
        'Demo complaint #' || seed.n || ' for order ORD-2026-' || LPAD((9000 + seed.n)::text, 4, '0') ||
        '. The customer reports that the issue affected their order experience and requests a review from support.',
    'ORD-2026-' || LPAD((9000 + seed.n)::text, 4, '0'),
    customer.phone,
    seed.category,
    CASE WHEN seed.status IN ('RESOLVING', 'RESOLVED') AND NOT seed.is_rejected THEN seed.priority ELSE NULL END,
    seed.status,
    CASE WHEN seed.status IN ('VALIDATING', 'RESOLVING', 'RESOLVED') THEN admin_user.id ELSE NULL END,
    NULL,
    CASE WHEN seed.status = 'RESOLVED' THEN admin_user.id ELSE NULL END,
    NULL,
    CASE
        WHEN seed.status IN ('RESOLVING', 'RESOLVED') AND NOT seed.is_rejected
            THEN 'Operational data did not match the expected customer order state.'
        ELSE NULL
    END,
    CASE
        WHEN seed.is_rejected
            THEN 'Complaint was rejected during validation because it did not meet handling criteria.'
        WHEN seed.status = 'RESOLVING'
            THEN 'A resolution is being prepared based on the validated root cause.'
        WHEN seed.status = 'RESOLVED'
            THEN 'The customer received a policy-aligned resolution for the reported issue.'
        ELSE NULL
    END,
    seed.submitted_time,
    CASE
        WHEN seed.status = 'PENDING' THEN seed.submitted_time
        WHEN seed.status = 'VALIDATING' THEN seed.submitted_time + INTERVAL '1 day'
        WHEN seed.status = 'RESOLVING' THEN seed.submitted_time + INTERVAL '3 days'
        ELSE LEAST(seed.submitted_time + INTERVAL '8 days', NOW())
    END,
    seed.submitted_time,
    CASE WHEN seed.status IN ('VALIDATING', 'RESOLVING', 'RESOLVED') THEN seed.submitted_time + INTERVAL '1 day' ELSE NULL END,
    NULL,
    CASE WHEN seed.status = 'RESOLVED' THEN LEAST(seed.submitted_time + INTERVAL '8 days', NOW()) ELSE NULL END,
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
