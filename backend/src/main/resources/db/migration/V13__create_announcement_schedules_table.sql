CREATE TABLE IF NOT EXISTS announcement_schedules (
    id              BIGSERIAL    PRIMARY KEY,
    announcement_id BIGINT       NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
    weekday         SMALLINT     NOT NULL,
    schedule_block_id BIGINT     NOT NULL REFERENCES schedule_blocks(id),
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_announcement_schedule UNIQUE (announcement_id, weekday, schedule_block_id)
);

CREATE INDEX IF NOT EXISTS idx_announcement_schedules_announcement
    ON announcement_schedules(announcement_id);

CREATE INDEX IF NOT EXISTS idx_announcement_schedules_weekday
    ON announcement_schedules(weekday);
