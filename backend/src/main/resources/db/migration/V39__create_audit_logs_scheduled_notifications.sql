-- V39: Create audit_logs table and notification scheduler tables

CREATE TABLE audit_logs (
    id BIGSERIAL PRIMARY KEY,
    action VARCHAR(50) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id BIGINT,
    entity_name VARCHAR(100),
    user_id BIGINT,
    username VARCHAR(100),
    institution_id BIGINT,
    details TEXT,
    old_values TEXT,
    new_values TEXT,
    status VARCHAR(50) DEFAULT 'EXITOSO',
    ip_address VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE scheduled_notifications (
    id BIGSERIAL PRIMARY KEY,
    notification_type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    target_type VARCHAR(30) NOT NULL,
    target_id BIGINT,
    institution_id BIGINT NOT NULL,
    schedule_cron VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    last_run TIMESTAMP,
    next_run TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_institution ON audit_logs(institution_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_scheduled_notif_institution ON scheduled_notifications(institution_id);
CREATE INDEX idx_scheduled_notif_active ON scheduled_notifications(is_active);
