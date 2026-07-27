CREATE TABLE IF NOT EXISTS holidays (
    id              BIGSERIAL PRIMARY KEY,
    institution_id  BIGINT NOT NULL REFERENCES institutions(id),
    name            VARCHAR(150) NOT NULL,
    holiday_date    DATE NOT NULL,
    category        VARCHAR(30) NOT NULL DEFAULT 'NACIONAL',
    description     TEXT,
    active          BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_holidays_institution ON holidays(institution_id);
CREATE INDEX idx_holidays_date ON holidays(holiday_date);
