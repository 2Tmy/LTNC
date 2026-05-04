-- ============================================================
-- FULL DATABASE SCHEMA — Production Ready
-- Contains all tables for Auth and Complaints modules.
--
-- Execution order on startup:
--   1. This file runs (Spring sql.init) — creates all tables
--   2. data.sql runs — seeds test accounts
-- ============================================================

DROP TABLE IF EXISTS complaints CASCADE;
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
    id         BIGSERIAL    NOT NULL,
    name       VARCHAR(255) NOT NULL,
    email      VARCHAR(255) NOT NULL,
    password   VARCHAR(255) NOT NULL,
    role       VARCHAR(50)  NOT NULL,
    enabled    BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP    NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_users       PRIMARY KEY (id),
    CONSTRAINT uk_users_email UNIQUE      (email),
    CONSTRAINT chk_users_role CHECK (role IN ('CUSTOMER', 'CS_STAFF', 'SPECIALIST', 'MANAGEMENT'))
);

-- email is the login key — queried on every login and JWT validation
CREATE INDEX idx_users_email ON users (email);
-- role is filtered frequently (staff vs customer routing)
CREATE INDEX idx_users_role  ON users (role);

-- ============================================================
-- COMPLAINTS MODULE SCHEMA
-- ============================================================

CREATE TABLE complaints (
    id             BIGSERIAL    NOT NULL,
    complaint_code VARCHAR(50)  NOT NULL,
    customer_id    BIGINT       NOT NULL,
    title          VARCHAR(255) NOT NULL,
    category       VARCHAR(100),
    priority       VARCHAR(50),
    status         VARCHAR(50)  NOT NULL,
    order_id       VARCHAR(100),
    description    TEXT,
    resolution     TEXT,
    created_at     TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMP    NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_complaints PRIMARY KEY (id),
    CONSTRAINT uk_complaints_code UNIQUE (complaint_code),
    CONSTRAINT fk_complaints_customer FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_complaints_customer ON complaints (customer_id);
CREATE INDEX idx_complaints_status   ON complaints (status);
CREATE INDEX idx_complaints_code     ON complaints (complaint_code);
