-- V19: Tutorias

-- 1. Sesiones de tutoria
CREATE TABLE tutoring_sessions (
    id                  BIGSERIAL PRIMARY KEY,
    institution_id      BIGINT NOT NULL REFERENCES institutions(id),
    teacher_id          BIGINT NOT NULL REFERENCES teachers(id),
    student_id          BIGINT NOT NULL REFERENCES students(id),
    course_id           BIGINT NOT NULL REFERENCES courses(id),
    academic_period_id  BIGINT NOT NULL REFERENCES academic_periods(id),
    session_date        DATE NOT NULL,
    session_time        TIME,
    duration_minutes    INTEGER DEFAULT 30,
    session_type        VARCHAR(30) NOT NULL DEFAULT 'ACADEMICA'
                        CHECK (session_type IN ('ACADEMICA', 'CONDUCTUAL', 'ORIENTACION', 'FAMILIAR', 'OTRO')),
    status              VARCHAR(20) NOT NULL DEFAULT 'PROGRAMADA'
                        CHECK (status IN ('PROGRAMADA', 'REALIZADA', 'CANCELADA', 'REPROGRAMADA')),
    topic               VARCHAR(250) NOT NULL,
    description         TEXT,
    recommendations     TEXT,
    follow_up_required  BOOLEAN NOT NULL DEFAULT FALSE,
    follow_up_date      DATE,
    follow_up_notes     TEXT,
    created_by          VARCHAR(100),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Seguimientos de tutoria
CREATE TABLE tutoring_follow_ups (
    id                  BIGSERIAL PRIMARY KEY,
    session_id          BIGINT NOT NULL REFERENCES tutoring_sessions(id) ON DELETE CASCADE,
    follow_up_date      DATE NOT NULL,
    notes               TEXT NOT NULL,
    status              VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE'
                        CHECK (status IN ('PENDIENTE', 'COMPLETADO')),
    completed_at        TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indices
CREATE INDEX idx_tutoring_sessions_institution ON tutoring_sessions(institution_id);
CREATE INDEX idx_tutoring_sessions_teacher ON tutoring_sessions(teacher_id);
CREATE INDEX idx_tutoring_sessions_student ON tutoring_sessions(student_id);
CREATE INDEX idx_tutoring_sessions_course ON tutoring_sessions(course_id);
CREATE INDEX idx_tutoring_sessions_period ON tutoring_sessions(academic_period_id);
CREATE INDEX idx_tutoring_sessions_date ON tutoring_sessions(session_date);
CREATE INDEX idx_tutoring_sessions_status ON tutoring_sessions(status);
CREATE INDEX idx_tutoring_follow_ups_session ON tutoring_follow_ups(session_id);
