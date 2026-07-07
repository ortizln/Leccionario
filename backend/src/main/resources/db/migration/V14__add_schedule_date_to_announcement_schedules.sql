-- Add schedule_date to announcement_schedules and update unique constraint
ALTER TABLE announcement_schedules
    ADD COLUMN schedule_date DATE;

-- Populate schedule_date from weekday (derive Monday of current week as base)
UPDATE announcement_schedules
SET schedule_date = (
    CURRENT_DATE - (EXTRACT(DOW FROM CURRENT_DATE)::INT - 1)
    + (weekday - 1)
);

ALTER TABLE announcement_schedules
    ALTER COLUMN schedule_date SET NOT NULL;

-- Drop old unique constraint, add new one with schedule_date
ALTER TABLE announcement_schedules
    DROP CONSTRAINT IF EXISTS uq_announcement_schedule;

ALTER TABLE announcement_schedules
    ADD CONSTRAINT uq_announcement_schedule
    UNIQUE (announcement_id, schedule_date, schedule_block_id);

CREATE INDEX IF NOT EXISTS idx_announcement_schedules_date
    ON announcement_schedules(schedule_date);
