-- Development schema. The current application configuration reloads this file
-- and data.sql on startup, so tables are intentionally recreated.

DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS complaint_feedbacks CASCADE;
DROP TABLE IF EXISTS complaint_attachments CASCADE;
DROP TABLE IF EXISTS complaint_validations CASCADE;
DROP TABLE IF EXISTS complaints CASCADE;
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
    id         BIGSERIAL     ,
    name       VARCHAR(255) NOT NULL,
    email      VARCHAR(255) NOT NULL,
    phone      VARCHAR(50),
    password   VARCHAR(255) ,
    role       VARCHAR(50) ,
    enabled    BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP    NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_users PRIMARY KEY (id),
    CONSTRAINT uk_users_email UNIQUE (email),
    CONSTRAINT chk_users_role
        CHECK (role IN ('CUSTOMER', 'ADMIN'))
);

CREATE INDEX idx_users_email ON users (email);
CREATE INDEX idx_users_role ON users (role);

CREATE TABLE complaints (
    id             BIGSERIAL    NOT NULL,
    complaint_code VARCHAR(50)  NOT NULL ,
    customer_id    BIGINT       NOT NULL,

    title          VARCHAR(500) NOT NULL,
    description    TEXT         NOT NULL,
    order_id       VARCHAR(100),
    phone          VARCHAR(50),
    resolution     TEXT,
    investigation_summary TEXT,
    root_cause     TEXT,
    category       VARCHAR(100) NOT NULL,
    priority       VARCHAR(50),
    status         VARCHAR(50)  NOT NULL DEFAULT 'PENDING',

    edit_count     INTEGER      NOT NULL DEFAULT 0,
    last_edited_at TIMESTAMP,
    edit_deadline  TIMESTAMP,

    validated_by   BIGINT,
    assigned_to    BIGINT,
    approved_by    BIGINT,
    
    created_at     TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMP    NOT NULL DEFAULT NOW(),
    submitted_at   TIMESTAMP    NOT NULL DEFAULT NOW(),
    validated_at   TIMESTAMP,
    assigned_at    TIMESTAMP,
    resolved_at    TIMESTAMP,

    CONSTRAINT pk_complaints PRIMARY KEY (id),
    CONSTRAINT uk_complaints_code UNIQUE (complaint_code),
    CONSTRAINT fk_complaints_customer
        FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_complaints_validated_by
        FOREIGN KEY (validated_by) REFERENCES users(id),
    CONSTRAINT fk_complaints_assigned_to
        FOREIGN KEY (assigned_to) REFERENCES users(id),
    CONSTRAINT fk_complaints_approved_by
        FOREIGN KEY (approved_by) REFERENCES users(id),
    CONSTRAINT chk_complaints_category
        CHECK (category IN ('PRODUCT', 'SERVICE', 'DELIVERY', 'BILLING', 'OTHER')),
    CONSTRAINT chk_complaints_priority
        CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),
    CONSTRAINT chk_complaints_status
        CHECK (status IN (
            'PENDING', 'VALIDATING', 'RESOLVING', 'RESOLVED'
        ))
);

CREATE UNIQUE INDEX idx_complaints_code       ON complaints (complaint_code);
CREATE INDEX idx_complaints_customer          ON complaints (customer_id);
CREATE INDEX idx_complaints_status            ON complaints (status);
CREATE INDEX idx_complaints_priority          ON complaints (priority);
CREATE INDEX idx_complaints_category          ON complaints (category);
CREATE INDEX idx_complaints_status_pri        ON complaints (status, priority);
CREATE INDEX idx_complaints_submitted         ON complaints (submitted_at);
CREATE INDEX idx_complaints_resolved          ON complaints (resolved_at);


CREATE TABLE complaint_feedbacks (
    id           BIGSERIAL NOT NULL,
    complaint_id BIGINT    NOT NULL,
    customer_id  BIGINT    NOT NULL,
    rating       INTEGER   NOT NULL,
    comment      TEXT,
    created_at   TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_complaint_feedbacks PRIMARY KEY (id),
    CONSTRAINT uk_complaint_feedbacks_complaint UNIQUE (complaint_id),
    CONSTRAINT fk_complaint_feedbacks_complaint
        FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE,
    CONSTRAINT fk_complaint_feedbacks_customer
        FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT chk_complaint_feedbacks_rating CHECK (rating BETWEEN 1 AND 5)
);

CREATE INDEX idx_complaint_feedbacks_customer
    ON complaint_feedbacks (customer_id, updated_at);

CREATE TABLE complaint_validations (
    id                      BIGSERIAL   NOT NULL,
    complaint_id            BIGINT      NOT NULL,
    validated_by            BIGINT      NOT NULL,
    validation_status       VARCHAR(50) NOT NULL,

    is_information_complete  BOOLEAN     NOT NULL DEFAULT FALSE,
    is_within_scope          BOOLEAN     NOT NULL DEFAULT FALSE,
    is_order_reference_valid BOOLEAN     NOT NULL DEFAULT FALSE,
    is_description_valid     BOOLEAN     NOT NULL DEFAULT FALSE,
    is_evidence_valid        BOOLEAN     NOT NULL DEFAULT FALSE,

    rejection_reason        TEXT,
    missing_information     TEXT,
    validation_notes        TEXT,
    validated_at            TIMESTAMP   NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_complaint_validations PRIMARY KEY (id),
    CONSTRAINT uk_complaint_validations_complaint UNIQUE (complaint_id),
    CONSTRAINT fk_complaint_validations_complaint
        FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE,
    CONSTRAINT fk_complaint_validations_user
        FOREIGN KEY (validated_by) REFERENCES users(id),
    CONSTRAINT chk_complaint_validations_status
        CHECK (validation_status IN ('VALID', 'INVALID'))
);


CREATE INDEX idx_validations_complaint  ON complaint_validations (complaint_id);
CREATE INDEX idx_validations_by         ON complaint_validations (validated_by);
CREATE INDEX idx_validations_status     ON complaint_validations (validation_status);



CREATE TABLE complaint_attachments (
    id                BIGSERIAL    NOT NULL,
    complaint_id      BIGINT       NOT NULL,
    uploaded_by       BIGINT       NOT NULL,
    file_name         VARCHAR(500) NOT NULL,
    file_type         VARCHAR(100) NOT NULL,
    file_size         BIGINT       NOT NULL,
    file_path         VARCHAR(1000) NOT NULL,
    is_evidence       BOOLEAN      NOT NULL DEFAULT TRUE,
    is_initial_upload BOOLEAN      NOT NULL DEFAULT FALSE,
    uploaded_at       TIMESTAMP    NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_complaint_attachments PRIMARY KEY (id),
    CONSTRAINT fk_complaint_attachments_complaint
        FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE,
    CONSTRAINT fk_complaint_attachments_user
        FOREIGN KEY (uploaded_by) REFERENCES users(id)
);
CREATE INDEX idx_attachments_complaint  ON complaint_attachments (complaint_id);
CREATE INDEX idx_attachments_uploader   ON complaint_attachments (uploaded_by);
 


CREATE TABLE notifications (
    id           BIGSERIAL    NOT NULL,
    user_id      BIGINT       NOT NULL,
    complaint_id BIGINT       NOT NULL,
    title        VARCHAR(500) NOT NULL,
    message      TEXT         NOT NULL,
    type         VARCHAR(50)  NOT NULL,
    action_url   VARCHAR(500),
    is_read      BOOLEAN      NOT NULL DEFAULT FALSE,
    read_at      TIMESTAMP,
    created_at   TIMESTAMP    NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_notifications PRIMARY KEY (id),
    CONSTRAINT fk_notifications_user
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_notifications_complaint
        FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE,
    CONSTRAINT chk_notifications_type
        CHECK (type IN (
            'COMPLAINT_RECEIVED', 'VALIDATION_VALID', 'VALIDATION_REJECTED',
            'VALIDATION_NEED_INFO', 'STATUS_CHANGE', 'NEW_COMMENT', 'CUSTOMER_FEEDBACK', 'ASSIGNED',
            'EDIT_REMINDER', 'EDIT_DEADLINE_PASSED'
        ))
);

CREATE INDEX idx_notifications_user ON notifications (user_id, created_at);
CREATE INDEX idx_notifications_user_unread ON notifications (user_id, is_read);
