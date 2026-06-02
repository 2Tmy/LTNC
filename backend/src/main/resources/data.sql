-- Explicit local demo seed. Run with --spring.profiles.active=seed to reset the database.
TRUNCATE TABLE users CASCADE;

-- All test accounts use the password: password123
-- BCrypt hash (cost 10): $2a$10$lncCO7RiUFbe4cCEBkXdpeBJTFjAoHKlewgHW3kUhKsV9vouKOWrq

INSERT INTO users (name, email, password, role, enabled, created_at, updated_at) VALUES
    ('Admin User',    'admin@test.com',   '$2a$10$lncCO7RiUFbe4cCEBkXdpeBJTFjAoHKlewgHW3kUhKsV9vouKOWrq', 'ADMIN',    true, NOW() - INTERVAL '60 days', NOW()),
    ('Support Agent', 'agent@test.com',   '$2a$10$lncCO7RiUFbe4cCEBkXdpeBJTFjAoHKlewgHW3kUhKsV9vouKOWrq', 'ADMIN',    true, NOW() - INTERVAL '60 days', NOW()),
    ('Alice Nguyen',  'alice@test.com',   '$2a$10$lncCO7RiUFbe4cCEBkXdpeBJTFjAoHKlewgHW3kUhKsV9vouKOWrq', 'CUSTOMER', true, NOW() - INTERVAL '30 days', NOW()),
    ('Bob Tran',      'bob@test.com',     '$2a$10$lncCO7RiUFbe4cCEBkXdpeBJTFjAoHKlewgHW3kUhKsV9vouKOWrq', 'CUSTOMER', true, NOW() - INTERVAL '25 days', NOW()),
    ('Charlie Le',    'charlie@test.com', '$2a$10$lncCO7RiUFbe4cCEBkXdpeBJTFjAoHKlewgHW3kUhKsV9vouKOWrq', 'CUSTOMER', true, NOW() - INTERVAL '20 days', NOW()),
    ('Diana Pham',    'diana@test.com',   '$2a$10$lncCO7RiUFbe4cCEBkXdpeBJTFjAoHKlewgHW3kUhKsV9vouKOWrq', 'CUSTOMER', true, NOW() - INTERVAL '18 days', NOW()),
    ('Edward Vu',     'edward@test.com',  '$2a$10$lncCO7RiUFbe4cCEBkXdpeBJTFjAoHKlewgHW3kUhKsV9vouKOWrq', 'CUSTOMER', true, NOW() - INTERVAL '15 days', NOW()),
    ('Fiona Hoang',   'fiona@test.com',   '$2a$10$lncCO7RiUFbe4cCEBkXdpeBJTFjAoHKlewgHW3kUhKsV9vouKOWrq', 'CUSTOMER', true, NOW() - INTERVAL '12 days', NOW()),
    ('George Do',     'george@test.com',  '$2a$10$lncCO7RiUFbe4cCEBkXdpeBJTFjAoHKlewgHW3kUhKsV9vouKOWrq', 'CUSTOMER', true, NOW() - INTERVAL '10 days', NOW()),
    ('Hannah Bui',    'hannah@test.com',  '$2a$10$lncCO7RiUFbe4cCEBkXdpeBJTFjAoHKlewgHW3kUhKsV9vouKOWrq', 'CUSTOMER', true, NOW() - INTERVAL '7 days',  NOW()),
    ('Ivan Dao',      'ivan@test.com',    '$2a$10$lncCO7RiUFbe4cCEBkXdpeBJTFjAoHKlewgHW3kUhKsV9vouKOWrq', 'CUSTOMER', true, NOW() - INTERVAL '5 days',  NOW()),
    ('Julia Ly',      'julia@test.com',   '$2a$10$lncCO7RiUFbe4cCEBkXdpeBJTFjAoHKlewgHW3kUhKsV9vouKOWrq', 'CUSTOMER', true, NOW() - INTERVAL '2 days',  NOW());

-- ──────────────────────────────────────────────────────────────────────────────
-- 10 complaints covering every possible status
-- ──────────────────────────────────────────────────────────────────────────────
INSERT INTO complaints (
    complaint_code, customer_id, title, description, order_id, phone,
    category, priority, status,
    validated_by, assigned_to, approved_by,
    investigation_summary, root_cause, resolution,
    created_at, updated_at, submitted_at,
    validated_at, assigned_at, resolved_at,
    edit_count, edit_deadline
) VALUES

-- 1. SUBMITTED — Julia just submitted, awaiting receipt by admin
(
    'RC-20260531-0001',
    (SELECT id FROM users WHERE email = 'julia@test.com'),
    'Missing items in my order',
    '[Partial Delivery]

I ordered 3 items but only received 2. The missing item is a blue backpack (item code: BP-201). The box appears undamaged so the item was likely missing from packing.',
    'ORD-20260530-8821', '0901234567',
    'PRODUCT', 'HIGH', 'SUBMITTED',
    NULL, NULL, NULL, NULL, NULL, NULL,
    NOW() - INTERVAL '2 days',  NOW() - INTERVAL '2 days',  NOW() - INTERVAL '2 days',
    NULL, NULL, NULL, 0, NULL
),

-- 2. SUBMITTED — Bob urgent, just submitted
(
    'RC-20260523-0002',
    (SELECT id FROM users WHERE email = 'bob@test.com'),
    'Fragile goods damaged on delivery',
    '[Damaged / Broken Goods]

Received my electronics order today and the screen is completely shattered. The outer packaging also shows significant impact damage. I need urgent replacement.',
    'ORD-20260522-4410', '0912345678',
    'PRODUCT', 'URGENT', 'SUBMITTED',
    NULL, NULL, NULL, NULL, NULL, NULL,
    NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days',
    NULL, NULL, NULL, 0, NULL
),

-- 3. PENDING_VALIDATION — Ivan: received by admin, queued for validation
(
    'RC-20260528-0003',
    (SELECT id FROM users WHERE email = 'ivan@test.com'),
    'Wrong item delivered – received competitor brand',
    '[Wrong Item Delivered]

I ordered brand X running shoes size 42, but received brand Y sandals size 40. The packing slip inside also shows a different customer name. This seems like a sorting mix-up.',
    'ORD-20260527-3390', '0923456789',
    'PRODUCT', 'MEDIUM', 'PENDING_VALIDATION',
    (SELECT id FROM users WHERE email = 'admin@test.com'),
    NULL, NULL, NULL, NULL, NULL,
    NOW() - INTERVAL '5 days',  NOW() - INTERVAL '4 days',  NOW() - INTERVAL '5 days',
    NOW() - INTERVAL '4 days',  NULL, NULL, 0, NULL
),

-- 4. INVESTIGATING — Hannah: validated valid, assigned to agent
(
    'RC-20260526-0004',
    (SELECT id FROM users WHERE email = 'hannah@test.com'),
    'Package delivered to wrong address',
    '[Delivered to Wrong Address]

My tracking shows the parcel was delivered yesterday but I never received it. A neighbor informed me the courier left it at house number 12 instead of 21. The parcel is no longer there.',
    'ORD-20260525-7765', '0934567890',
    'DELIVERY', 'HIGH', 'INVESTIGATING',
    (SELECT id FROM users WHERE email = 'admin@test.com'),
    (SELECT id FROM users WHERE email = 'agent@test.com'),
    NULL, NULL, NULL, NULL,
    NOW() - INTERVAL '7 days',  NOW() - INTERVAL '5 days',  NOW() - INTERVAL '7 days',
    NOW() - INTERVAL '6 days',  NOW() - INTERVAL '5 days',  NULL, 0, NULL
),

-- 5. INVESTIGATING — Alice: 12 days old, being investigated
(
    'RC-20260521-0005',
    (SELECT id FROM users WHERE email = 'alice@test.com'),
    'Late delivery – 8 days overdue',
    '[Late Delivery]

My order was promised for delivery within 3 business days (ordered May 15). Today is May 21 and the tracking still shows "In Transit". This has caused significant inconvenience as the item was needed for an event.',
    'ORD-20260515-2201', '0945678901',
    'DELIVERY', 'HIGH', 'INVESTIGATING',
    (SELECT id FROM users WHERE email = 'admin@test.com'),
    (SELECT id FROM users WHERE email = 'admin@test.com'),
    NULL, NULL, NULL, NULL,
    NOW() - INTERVAL '12 days', NOW() - INTERVAL '9 days',  NOW() - INTERVAL '12 days',
    NOW() - INTERVAL '11 days', NOW() - INTERVAL '9 days',  NULL, 0, NULL
),

-- 6. RESOLVING — George: resolution drafted, awaiting send
(
    'RC-20260523-0006',
    (SELECT id FROM users WHERE email = 'george@test.com'),
    'Double charged for single order',
    '[Billing Issue]

My bank statement shows two identical charges of 450,000 VND on May 22 for order ORD-20260522-5543. I only placed one order. Please refund the duplicate charge.',
    'ORD-20260522-5543', '0956789012',
    'BILLING', 'HIGH', 'RESOLVING',
    (SELECT id FROM users WHERE email = 'admin@test.com'),
    (SELECT id FROM users WHERE email = 'agent@test.com'),
    NULL,
    'Investigated payment gateway logs. A network timeout caused the payment processor to retry the transaction, resulting in two successful charges for the same order.',
    'Payment gateway retry logic did not check for an existing successful transaction before submitting a duplicate charge.',
    'A full refund of 450,000 VND for the duplicate charge has been initiated and will be credited within 3–5 business days.',
    NOW() - INTERVAL '10 days', NOW() - INTERVAL '2 days',  NOW() - INTERVAL '10 days',
    NOW() - INTERVAL '9 days',  NOW() - INTERVAL '8 days',  NULL, 0, NULL
),

-- 7. RESOLVED — Fiona: fully resolved
(
    'RC-20260521-0007',
    (SELECT id FROM users WHERE email = 'fiona@test.com'),
    'Discount code not applied at checkout',
    '[Billing Issue]

My invoice shows 550,000 VND but I applied a 10% first-order discount code FIRST10. The discount was not applied and I was charged the full amount.',
    'ORD-20260520-9920', '0967890123',
    'BILLING', 'MEDIUM', 'RESOLVED',
    (SELECT id FROM users WHERE email = 'admin@test.com'),
    (SELECT id FROM users WHERE email = 'agent@test.com'),
    (SELECT id FROM users WHERE email = 'admin@test.com'),
    'Confirmed the promo code FIRST10 was valid and should have been applied. A system error caused the discount to be skipped during checkout.',
    'Promo code validation service had an intermittent bug that occasionally skipped discount application when applied within 1 second of adding the last cart item.',
    'Refunded 55,000 VND (10% of 550,000 VND) to the original payment method. The discount code bug has been reported to the engineering team.',
    NOW() - INTERVAL '12 days', NOW() - INTERVAL '5 days',  NOW() - INTERVAL '12 days',
    NOW() - INTERVAL '11 days', NOW() - INTERVAL '10 days', NOW() - INTERVAL '5 days',
    0, NULL
),

-- 8. REJECTED — Edward: rejected during validation (out of scope)
(
    'RC-20260518-0008',
    (SELECT id FROM users WHERE email = 'edward@test.com'),
    'Website is too slow to complete purchase',
    '[Other]

The website is very slow and I could not complete my purchase for 20 minutes. This is unacceptable and cost me a limited-time deal.',
    'N/A', '0978901234',
    'OTHER', 'LOW', 'REJECTED',
    (SELECT id FROM users WHERE email = 'admin@test.com'),
    NULL, NULL, NULL, NULL, NULL,
    NOW() - INTERVAL '15 days', NOW() - INTERVAL '13 days', NOW() - INTERVAL '15 days',
    NOW() - INTERVAL '13 days', NULL, NULL, 0, NULL
),

-- 9. NEED_MORE_INFO — Diana: validation requested additional evidence
(
    'RC-20260515-0009',
    (SELECT id FROM users WHERE email = 'diana@test.com'),
    'Product quality below advertised standard',
    '[Damaged / Broken Goods]

The shirt I received looks nothing like the product photo. The color is different and the material feels much cheaper than described.',
    'ORD-20260514-1122', '0989012345',
    'PRODUCT', 'MEDIUM', 'NEED_MORE_INFO',
    (SELECT id FROM users WHERE email = 'admin@test.com'),
    NULL, NULL, NULL, NULL, NULL,
    NOW() - INTERVAL '18 days', NOW() - INTERVAL '14 days', NOW() - INTERVAL '18 days',
    NOW() - INTERVAL '16 days', NULL, NULL, 0,
    NOW() + INTERVAL '7 days'
),

-- 10. CLOSED — Charlie: old resolved complaint, now closed
(
    'RC-20260513-0010',
    (SELECT id FROM users WHERE email = 'charlie@test.com'),
    'Lost package – never arrived after 15 days',
    '[Lost Package]

My package has been stuck at "In Transit" for 15 days with no updates. The estimated delivery was 10 days ago. Tracking shows no activity since the item left the origin hub.',
    'ORD-20260505-0033', '0990123456',
    'DELIVERY', 'HIGH', 'CLOSED',
    (SELECT id FROM users WHERE email = 'admin@test.com'),
    (SELECT id FROM users WHERE email = 'agent@test.com'),
    (SELECT id FROM users WHERE email = 'admin@test.com'),
    'Investigation confirmed the package was lost in transit at the regional sorting hub due to a label scanning failure.',
    'Label scanning equipment malfunction at the hub caused the package to be misrouted and eventually lost.',
    'A full replacement order has been shipped with priority delivery. A 50,000 VND store credit was also issued as compensation.',
    NOW() - INTERVAL '20 days', NOW() - INTERVAL '6 days',  NOW() - INTERVAL '20 days',
    NOW() - INTERVAL '19 days', NOW() - INTERVAL '18 days', NOW() - INTERVAL '7 days',
    0, NULL
);

-- ──────────────────────────────────────────────────────────────────────────────
-- Validation records (required for complaints beyond PENDING_VALIDATION)
-- ──────────────────────────────────────────────────────────────────────────────
INSERT INTO complaint_validations (
    complaint_id, validated_by, validation_status,
    is_information_complete, is_within_scope,
    is_order_reference_valid, is_description_valid, is_evidence_valid,
    rejection_reason, missing_information, validation_notes, validated_at
) VALUES

-- Hannah (INVESTIGATING) — VALID
(
    (SELECT id FROM complaints WHERE complaint_code = 'RC-20260526-0004'),
    (SELECT id FROM users WHERE email = 'admin@test.com'),
    'VALID', true, true, true, true, true,
    NULL, NULL, 'Clear complaint with photo evidence of wrong delivery address.',
    NOW() - INTERVAL '6 days'
),

-- Alice (INVESTIGATING) — VALID
(
    (SELECT id FROM complaints WHERE complaint_code = 'RC-20260521-0005'),
    (SELECT id FROM users WHERE email = 'admin@test.com'),
    'VALID', true, true, true, true, true,
    NULL, NULL, 'Late delivery confirmed against order timestamp and tracking history.',
    NOW() - INTERVAL '11 days'
),

-- George (RESOLVING) — VALID
(
    (SELECT id FROM complaints WHERE complaint_code = 'RC-20260523-0006'),
    (SELECT id FROM users WHERE email = 'admin@test.com'),
    'VALID', true, true, true, true, true,
    NULL, NULL, 'Double charge confirmed via payment gateway records.',
    NOW() - INTERVAL '9 days'
),

-- Fiona (RESOLVED) — VALID
(
    (SELECT id FROM complaints WHERE complaint_code = 'RC-20260521-0007'),
    (SELECT id FROM users WHERE email = 'admin@test.com'),
    'VALID', true, true, true, true, true,
    NULL, NULL, 'Promo code issue confirmed against order and discount logs.',
    NOW() - INTERVAL '11 days'
),

-- Edward (REJECTED) — INVALID (out of scope)
(
    (SELECT id FROM complaints WHERE complaint_code = 'RC-20260518-0008'),
    (SELECT id FROM users WHERE email = 'admin@test.com'),
    'INVALID', false, false, false, false, false,
    'This complaint is outside the scope of the complaint management system. Website performance issues should be reported via the technical support channel.',
    'No valid order reference provided. The complaint does not relate to goods or delivery.',
    'Complaint rejected — not within scope.',
    NOW() - INTERVAL '13 days'
),

-- Diana (NEED_MORE_INFO) — NEED_MORE_INFO
(
    (SELECT id FROM complaints WHERE complaint_code = 'RC-20260515-0009'),
    (SELECT id FROM users WHERE email = 'admin@test.com'),
    'NEED_MORE_INFO', false, true, true, true, false,
    NULL,
    'Please provide clear comparison photos of the received item next to the product listing. Include photos of the item label and packaging.',
    'Evidence insufficient — no comparison photos provided.',
    NOW() - INTERVAL '16 days'
),

-- Charlie (CLOSED) — VALID
(
    (SELECT id FROM complaints WHERE complaint_code = 'RC-20260513-0010'),
    (SELECT id FROM users WHERE email = 'admin@test.com'),
    'VALID', true, true, true, true, true,
    NULL, NULL, 'Lost package confirmed via carrier investigation report.',
    NOW() - INTERVAL '19 days'
);

-- ──────────────────────────────────────────────────────────────────────────────
-- Evidence attachments (placeholder paths — actual files are not on disk)
-- ──────────────────────────────────────────────────────────────────────────────
INSERT INTO complaint_attachments (
    complaint_id, uploaded_by, file_name, file_type, file_size, file_path,
    is_evidence, is_initial_upload, uploaded_at
) VALUES
(
    (SELECT id FROM complaints WHERE complaint_code = 'RC-20260531-0001'),
    (SELECT id FROM users WHERE email = 'julia@test.com'),
    'order_contents_photo.jpg', 'image/jpeg', 245760,
    'uploads/RC-20260531-0001/order_contents_photo.jpg',
    true, true, NOW() - INTERVAL '2 days'
),
(
    (SELECT id FROM complaints WHERE complaint_code = 'RC-20260523-0002'),
    (SELECT id FROM users WHERE email = 'bob@test.com'),
    'damaged_screen.jpg', 'image/jpeg', 512000,
    'uploads/RC-20260523-0002/damaged_screen.jpg',
    true, true, NOW() - INTERVAL '10 days'
),
(
    (SELECT id FROM complaints WHERE complaint_code = 'RC-20260523-0002'),
    (SELECT id FROM users WHERE email = 'bob@test.com'),
    'damaged_packaging.jpg', 'image/jpeg', 389120,
    'uploads/RC-20260523-0002/damaged_packaging.jpg',
    true, true, NOW() - INTERVAL '10 days'
),
(
    (SELECT id FROM complaints WHERE complaint_code = 'RC-20260528-0003'),
    (SELECT id FROM users WHERE email = 'ivan@test.com'),
    'wrong_item_received.jpg', 'image/jpeg', 307200,
    'uploads/RC-20260528-0003/wrong_item_received.jpg',
    true, true, NOW() - INTERVAL '5 days'
),
(
    (SELECT id FROM complaints WHERE complaint_code = 'RC-20260528-0003'),
    (SELECT id FROM users WHERE email = 'ivan@test.com'),
    'packing_slip.jpg', 'image/jpeg', 204800,
    'uploads/RC-20260528-0003/packing_slip.jpg',
    true, true, NOW() - INTERVAL '5 days'
),
(
    (SELECT id FROM complaints WHERE complaint_code = 'RC-20260526-0004'),
    (SELECT id FROM users WHERE email = 'hannah@test.com'),
    'delivery_confirmation_screenshot.png', 'image/png', 156000,
    'uploads/RC-20260526-0004/delivery_confirmation_screenshot.png',
    true, true, NOW() - INTERVAL '7 days'
),
(
    (SELECT id FROM complaints WHERE complaint_code = 'RC-20260521-0005'),
    (SELECT id FROM users WHERE email = 'alice@test.com'),
    'tracking_screenshot.png', 'image/png', 198400,
    'uploads/RC-20260521-0005/tracking_screenshot.png',
    true, true, NOW() - INTERVAL '12 days'
),
(
    (SELECT id FROM complaints WHERE complaint_code = 'RC-20260523-0006'),
    (SELECT id FROM users WHERE email = 'george@test.com'),
    'bank_statement.pdf', 'application/pdf', 92160,
    'uploads/RC-20260523-0006/bank_statement.pdf',
    true, true, NOW() - INTERVAL '10 days'
),
(
    (SELECT id FROM complaints WHERE complaint_code = 'RC-20260521-0007'),
    (SELECT id FROM users WHERE email = 'fiona@test.com'),
    'invoice.pdf', 'application/pdf', 81920,
    'uploads/RC-20260521-0007/invoice.pdf',
    true, true, NOW() - INTERVAL '12 days'
),
(
    (SELECT id FROM complaints WHERE complaint_code = 'RC-20260518-0008'),
    (SELECT id FROM users WHERE email = 'edward@test.com'),
    'website_slowness_screenshot.png', 'image/png', 234560,
    'uploads/RC-20260518-0008/website_slowness_screenshot.png',
    true, true, NOW() - INTERVAL '15 days'
),
(
    (SELECT id FROM complaints WHERE complaint_code = 'RC-20260515-0009'),
    (SELECT id FROM users WHERE email = 'diana@test.com'),
    'product_received.jpg', 'image/jpeg', 276480,
    'uploads/RC-20260515-0009/product_received.jpg',
    true, true, NOW() - INTERVAL '18 days'
),
(
    (SELECT id FROM complaints WHERE complaint_code = 'RC-20260513-0010'),
    (SELECT id FROM users WHERE email = 'charlie@test.com'),
    'tracking_proof.png', 'image/png', 163840,
    'uploads/RC-20260513-0010/tracking_proof.png',
    true, true, NOW() - INTERVAL '20 days'
);
