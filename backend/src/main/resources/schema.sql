-- ================================================
-- SCHEMA FINAL - OPTIMIZED FOR STUDENT PROJECT
-- ================================================
-- Tối ưu cho: Customer update info khi NEED_MORE_INFO
-- Thiết kế: ĐƠN GIẢN, HIỆU QUẢ, ĐỦ CHỨC NĂNG
-- ================================================

-- ==================== TABLE: users ====================
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_user_role CHECK (role IN ('CUSTOMER', 'CS_STAFF', 'SPECIALIST', 'MANAGEMENT'))
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- ==================== TABLE: complaints ====================
CREATE TABLE IF NOT EXISTS complaints (
    id BIGSERIAL PRIMARY KEY,
    customer_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Basic info
    title VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    priority VARCHAR(50) DEFAULT 'MEDIUM',
    status VARCHAR(50) DEFAULT 'SUBMITTED',
    
    -- 🌟 EDIT TRACKING (KEY FEATURE)
    edit_count INT DEFAULT 0,              -- Số lần customer đã sửa
    last_edited_at TIMESTAMP,              -- Lần cuối customer sửa
    edit_deadline TIMESTAMP,               -- Deadline phải sửa xong (7 ngày)
    
    -- Role assignments
    validated_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
    assigned_to BIGINT REFERENCES users(id) ON DELETE SET NULL,
    approved_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    validated_at TIMESTAMP,
    assigned_at TIMESTAMP,
    resolved_at TIMESTAMP,
    
    -- Constraints
    CONSTRAINT chk_category CHECK (category IN ('PRODUCT', 'SERVICE', 'DELIVERY', 'BILLING', 'OTHER')),
    CONSTRAINT chk_priority CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),
    CONSTRAINT chk_status CHECK (status IN (
        'SUBMITTED', 
        'PENDING_VALIDATION', 
        'VALIDATED', 
        'REJECTED', 
        'NEED_MORE_INFO',
        'IN_REVIEW', 
        'INVESTIGATING', 
        'RESOLVED', 
        'CLOSED'
    ))
);

-- Indexes
CREATE INDEX idx_complaints_customer ON complaints(customer_id);
CREATE INDEX idx_complaints_validated_by ON complaints(validated_by);
CREATE INDEX idx_complaints_assigned_to ON complaints(assigned_to);
CREATE INDEX idx_complaints_status ON complaints(status);
CREATE INDEX idx_complaints_priority ON complaints(priority);
CREATE INDEX idx_complaints_status_priority ON complaints(status, priority);
CREATE INDEX idx_complaints_edit_deadline ON complaints(edit_deadline) WHERE status = 'NEED_MORE_INFO';

-- ==================== TABLE: complaint_validations ====================
CREATE TABLE IF NOT EXISTS complaint_validations (
    id BIGSERIAL PRIMARY KEY,
    complaint_id BIGINT NOT NULL UNIQUE REFERENCES complaints(id) ON DELETE CASCADE,
    validated_by BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    
    validation_status VARCHAR(50) NOT NULL,
    is_information_complete BOOLEAN NOT NULL DEFAULT false,
    is_within_scope BOOLEAN NOT NULL DEFAULT false,
    
    rejection_reason TEXT,
    missing_information TEXT,  -- 🌟 "Vui lòng cung cấp: serial number, ảnh sản phẩm"
    validation_notes TEXT,
    
    validated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_validation_status CHECK (validation_status IN ('VALID', 'INVALID', 'NEED_MORE_INFO'))
);

CREATE INDEX idx_validation_complaint ON complaint_validations(complaint_id);
CREATE INDEX idx_validation_by ON complaint_validations(validated_by);

-- ==================== TABLE: complaint_attachments ====================
CREATE TABLE IF NOT EXISTS complaint_attachments (
    id BIGSERIAL PRIMARY KEY,
    complaint_id BIGINT NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
    uploaded_by BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    
    file_name VARCHAR(500) NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    file_size BIGINT NOT NULL,
    file_path VARCHAR(1000) NOT NULL,
    
    is_evidence BOOLEAN DEFAULT true,
    is_initial_upload BOOLEAN DEFAULT false,  -- 🌟 true=upload lúc tạo, false=upload sau
    
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_attachment_complaint ON complaint_attachments(complaint_id);
CREATE INDEX idx_attachment_uploader ON complaint_attachments(uploaded_by);

-- ==================== TABLE: complaint_comments ====================
CREATE TABLE IF NOT EXISTS complaint_comments (
    id BIGSERIAL PRIMARY KEY,
    complaint_id BIGINT NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    
    comment_text TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_comment_complaint ON complaint_comments(complaint_id);
CREATE INDEX idx_comment_user ON complaint_comments(user_id);

-- ==================== TABLE: complaint_histories (UNIFIED) ====================
-- 🌟 1 bảng duy nhất track TẤT CẢ changes
CREATE TABLE IF NOT EXISTS complaint_histories (
    id BIGSERIAL PRIMARY KEY,
    complaint_id BIGINT NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
    changed_by BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    
    -- Action type
    action_type VARCHAR(50) NOT NULL,  -- STATUS_CHANGED, INFO_UPDATED, FILE_UPLOADED, FILE_DELETED
    
    -- Status tracking (chỉ fill khi STATUS_CHANGED)
    old_status VARCHAR(50),
    new_status VARCHAR(50),
    
    -- Info tracking (chỉ fill khi INFO_UPDATED)
    old_title VARCHAR(500),      -- 🌟 ADDED
    new_title VARCHAR(500),      -- 🌟 ADDED
    old_description TEXT,
    new_description TEXT,
    
    -- File tracking (chỉ fill khi FILE_UPLOADED/DELETED)
    file_name VARCHAR(500),      -- 🌟 CHANGED: Lưu trực tiếp tên file (KHÔNG dùng FK)
    file_size BIGINT,            -- 🌟 ADDED
    
    reason TEXT,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_action_type CHECK (action_type IN (
        'STATUS_CHANGED',
        'INFO_UPDATED',
        'FILE_UPLOADED',
        'FILE_DELETED'
    ))
);

CREATE INDEX idx_history_complaint ON complaint_histories(complaint_id);
CREATE INDEX idx_history_action ON complaint_histories(action_type);
CREATE INDEX idx_history_changed_by ON complaint_histories(changed_by);
CREATE INDEX idx_history_timeline ON complaint_histories(complaint_id, changed_at);

-- ==================== TABLE: notifications ====================
CREATE TABLE IF NOT EXISTS notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    complaint_id BIGINT REFERENCES complaints(id) ON DELETE SET NULL,
    
    title VARCHAR(500) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    
    action_url VARCHAR(500),     -- 🌟 ADDED: Frontend redirect URL
    
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_notif_type CHECK (type IN (
        'COMPLAINT_RECEIVED',
        'VALIDATION_VALID',
        'VALIDATION_REJECTED',
        'VALIDATION_NEED_INFO',
        'STATUS_CHANGE',
        'NEW_COMMENT',
        'ASSIGNED',
        'EDIT_REMINDER',         -- 🌟 Nhắc customer sửa
        'EDIT_DEADLINE_PASSED'   -- 🌟 Deadline đã qua
    ))
);

CREATE INDEX idx_notif_user ON notifications(user_id);
CREATE INDEX idx_notif_unread ON notifications(user_id, is_read);
CREATE INDEX idx_notif_complaint ON notifications(complaint_id);

-- ==================== COMMENTS ====================
COMMENT ON COLUMN complaints.edit_count IS 
'Số lần customer đã sửa complaint. Tăng mỗi khi: update description, update title, upload file';

COMMENT ON COLUMN complaints.last_edited_at IS 
'Thời gian lần cuối customer sửa. Dùng để check timeout';

COMMENT ON COLUMN complaints.edit_deadline IS 
'Deadline customer phải sửa xong. Set = NOW() + 7 days khi status = NEED_MORE_INFO';

COMMENT ON COLUMN complaint_attachments.is_initial_upload IS 
'true = File upload lúc tạo complaint, false = File upload sau khi NEED_MORE_INFO';

COMMENT ON COLUMN complaint_histories.file_name IS 
'Lưu trực tiếp tên file (KHÔNG dùng FK). Lý do: Nếu file bị xóa, history vẫn còn';

COMMENT ON COLUMN notifications.action_url IS 
'URL để redirect khi user click notification. VD: /customer/complaints/123';

COMMENT ON TABLE complaint_histories IS 
'Unified audit trail - Track tất cả changes (status, description, files) trong 1 bảng';