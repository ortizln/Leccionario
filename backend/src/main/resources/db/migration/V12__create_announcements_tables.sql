CREATE TABLE announcements (
    id              BIGSERIAL PRIMARY KEY,
    title           VARCHAR(200) NOT NULL,
    description     TEXT NOT NULL,
    announcement_type VARCHAR(20) NOT NULL,
    priority        VARCHAR(10) NOT NULL DEFAULT 'NORMAL',
    event_date      DATE,
    event_end_date  DATE,
    course_id       BIGINT REFERENCES courses(id),
    created_by      BIGINT NOT NULL REFERENCES users(id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_announcements_event_date ON announcements(event_date);
CREATE INDEX idx_announcements_course ON announcements(course_id);
CREATE INDEX idx_announcements_type ON announcements(announcement_type);

CREATE TABLE announcement_recipients (
    id              BIGSERIAL PRIMARY KEY,
    announcement_id BIGINT NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
    user_id         BIGINT NOT NULL REFERENCES users(id),
    is_read         BOOLEAN NOT NULL DEFAULT FALSE,
    read_at         TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_announcement_user UNIQUE (announcement_id, user_id)
);

CREATE INDEX idx_announcement_recipients_user ON announcement_recipients(user_id);
CREATE INDEX idx_announcement_recipients_unread ON announcement_recipients(user_id, is_read);
