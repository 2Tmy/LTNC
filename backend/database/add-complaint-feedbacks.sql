CREATE TABLE IF NOT EXISTS complaint_feedbacks (
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

CREATE INDEX IF NOT EXISTS idx_complaint_feedbacks_customer
    ON complaint_feedbacks (customer_id, updated_at);

ALTER TABLE notifications
    DROP CONSTRAINT IF EXISTS chk_notifications_type;

ALTER TABLE notifications
    ADD CONSTRAINT chk_notifications_type
    CHECK (type IN (
        'COMPLAINT_RECEIVED', 'VALIDATION_VALID', 'VALIDATION_REJECTED',
        'VALIDATION_NEED_INFO', 'STATUS_CHANGE', 'NEW_COMMENT',
        'CUSTOMER_FEEDBACK', 'ASSIGNED', 'EDIT_REMINDER',
        'EDIT_DEADLINE_PASSED'
    ));
