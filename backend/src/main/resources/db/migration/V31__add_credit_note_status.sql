-- V31: Add status column to credit_notes

ALTER TABLE credit_notes ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'PENDING';
CREATE INDEX idx_credit_notes_status ON credit_notes(status);
