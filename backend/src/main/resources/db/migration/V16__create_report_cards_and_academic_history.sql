-- V16: Libretas (Report Cards) + Historial Academico

-- 1. Libretas / Report Cards generadas por periodo
CREATE TABLE report_cards (
    id                  BIGSERIAL PRIMARY KEY,
    student_id          BIGINT NOT NULL REFERENCES students(id),
    course_id           BIGINT NOT NULL REFERENCES courses(id),
    academic_period_id  BIGINT NOT NULL REFERENCES academic_periods(id),
    status              VARCHAR(20) NOT NULL DEFAULT 'DRAFT'
                        CHECK (status IN ('DRAFT', 'FINALIZED', 'SIGNED', 'DELIVERED')),
    overall_average     DECIMAL(5,2),
    final_status        VARCHAR(20) CHECK (final_status IN ('APPROVED', 'FAILED', 'RECOVERY', 'PENDING')),
    teacher_comments    TEXT,
    conduct_notes       TEXT,
    attendance_summary  JSONB,
    observations        TEXT,
    generated_by        VARCHAR(100),
    generated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    signed_at           TIMESTAMPTZ,
    delivered_at        TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_report_card UNIQUE (student_id, course_id, academic_period_id)
);

-- 2. Detalle de la libreta: notas por materia
CREATE TABLE report_card_details (
    id                  BIGSERIAL PRIMARY KEY,
    report_card_id      BIGINT NOT NULL REFERENCES report_cards(id) ON DELETE CASCADE,
    subject_id          BIGINT NOT NULL REFERENCES subjects(id),
    teacher_id          BIGINT NOT NULL REFERENCES teachers(id),
    average_score       DECIMAL(5,2),
    status              VARCHAR(20) NOT NULL DEFAULT 'PENDING'
                        CHECK (status IN ('PENDING', 'APPROVED', 'FAILED')),
    teacher_comment     VARCHAR(500),
    evaluation_count    INTEGER DEFAULT 0,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_rc_detail UNIQUE (report_card_id, subject_id)
);

-- 3. Vista de historial academico (agrega period_grades por estudiante)
CREATE OR REPLACE VIEW v_academic_history AS
SELECT
    pg.student_id,
    s.enrollment_number,
    u.first_name || ' ' || u.last_name AS student_name,
    pg.course_id,
    c.name AS course_name,
    pg.subject_id,
    sub.name AS subject_name,
    pg.academic_period_id,
    ap.name AS period_name,
    ap.start_date AS period_start,
    ap.end_date AS period_end,
    pg.average_score,
    pg.status,
    pg.teacher_notes,
    pg.calculated_at
FROM period_grades pg
JOIN students s ON s.id = pg.student_id
JOIN users u ON u.id = s.user_id
JOIN courses c ON c.id = pg.course_id
JOIN subjects sub ON sub.id = pg.subject_id
JOIN academic_periods ap ON ap.id = pg.academic_period_id;

-- Indices
CREATE INDEX idx_report_cards_student ON report_cards(student_id);
CREATE INDEX idx_report_cards_course ON report_cards(course_id);
CREATE INDEX idx_report_cards_period ON report_cards(academic_period_id);
CREATE INDEX idx_report_cards_status ON report_cards(status);
CREATE INDEX idx_rc_details_report ON report_card_details(report_card_id);
CREATE INDEX idx_rc_details_subject ON report_card_details(subject_id);
