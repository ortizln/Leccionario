-- V15: Modulo de Calificaciones - Escalas, Evaluaciones mejoradas, Calificaciones, Promedios por periodo

-- 1. Escalas de calificacion (configurables por institucion)
CREATE TABLE grade_scales (
    id              BIGSERIAL PRIMARY KEY,
    institution_id  BIGINT NOT NULL REFERENCES institutions(id),
    name            VARCHAR(100) NOT NULL,
    scale_type      VARCHAR(20) NOT NULL CHECK (scale_type IN ('NUMERIC_10', 'NUMERIC_100', 'LETTER', 'COMPETENCY')),
    min_value       DECIMAL(5,2) NOT NULL DEFAULT 0,
    max_value       DECIMAL(5,2) NOT NULL DEFAULT 10,
    pass_value      DECIMAL(5,2) NOT NULL DEFAULT 7,
    is_default      BOOLEAN NOT NULL DEFAULT FALSE,
    active          BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_grade_scale_name_inst UNIQUE (institution_id, name)
);

-- 2. Tipos de evaluacion (parciales, finales, proyectos, etc.)
CREATE TABLE evaluation_types (
    id              BIGSERIAL PRIMARY KEY,
    institution_id  BIGINT NOT NULL REFERENCES institutions(id),
    name            VARCHAR(100) NOT NULL,
    code            VARCHAR(30) NOT NULL,
    description     VARCHAR(300),
    weight_pct      DECIMAL(5,2) NOT NULL DEFAULT 100.00,
    active          BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_eval_type_code_inst UNIQUE (institution_id, code)
);

-- 3. Mejorar tabla evaluations existente (agregar campos nuevos)
ALTER TABLE evaluations
    ADD COLUMN IF NOT EXISTS academic_period_id  BIGINT REFERENCES academic_periods(id),
    ADD COLUMN IF NOT EXISTS evaluation_type_id  BIGINT REFERENCES evaluation_types(id),
    ADD COLUMN IF NOT EXISTS evaluation_date     DATE,
    ADD COLUMN IF NOT EXISTS weight              DECIMAL(5,2) DEFAULT 1.00,
    ADD COLUMN IF NOT EXISTS max_score           DECIMAL(5,2) DEFAULT 10.00,
    ADD COLUMN IF NOT EXISTS scale_id            BIGINT REFERENCES grade_scales(id);

-- 4. Calificaciones individuales por estudiante por evaluacion
CREATE TABLE grades (
    id              BIGSERIAL PRIMARY KEY,
    evaluation_id   BIGINT NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
    student_id      BIGINT NOT NULL REFERENCES students(id),
    score           DECIMAL(5,2) NOT NULL,
    comment         VARCHAR(500),
    graded_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    graded_by       VARCHAR(100),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_grade_eval_student UNIQUE (evaluation_id, student_id)
);

-- 5. Promedios por periodo (agregacion automatica)
CREATE TABLE period_grades (
    id                  BIGSERIAL PRIMARY KEY,
    student_id          BIGINT NOT NULL REFERENCES students(id),
    course_id           BIGINT NOT NULL REFERENCES courses(id),
    subject_id          BIGINT NOT NULL REFERENCES subjects(id),
    academic_period_id  BIGINT NOT NULL REFERENCES academic_periods(id),
    average_score       DECIMAL(5,2),
    status              VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'FAILED', 'RECOVERY')),
    teacher_notes       VARCHAR(500),
    calculated_at       TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_period_grade UNIQUE (student_id, course_id, subject_id, academic_period_id)
);

-- 6. Historial de calificaciones (auditoria de cambios)
CREATE TABLE grade_history (
    id              BIGSERIAL PRIMARY KEY,
    grade_id        BIGINT NOT NULL REFERENCES grades(id) ON DELETE CASCADE,
    old_score       DECIMAL(5,2),
    new_score       DECIMAL(5,2) NOT NULL,
    changed_by      VARCHAR(100) NOT NULL,
    changed_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reason          VARCHAR(300)
);

-- Indices
CREATE INDEX idx_grade_scales_institution ON grade_scales(institution_id);
CREATE INDEX idx_eval_types_institution ON evaluation_types(institution_id);
CREATE INDEX idx_evaluations_period ON evaluations(academic_period_id);
CREATE INDEX idx_evaluations_type ON evaluations(evaluation_type_id);
CREATE INDEX idx_evaluations_date ON evaluations(evaluation_date);
CREATE INDEX idx_grades_student ON grades(student_id);
CREATE INDEX idx_grades_evaluation ON grades(evaluation_id);
CREATE INDEX idx_period_grades_student ON period_grades(student_id);
CREATE INDEX idx_period_grades_course ON period_grades(course_id);
CREATE INDEX idx_period_grades_subject ON period_grades(subject_id);
CREATE INDEX idx_period_grades_period ON period_grades(academic_period_id);
CREATE INDEX idx_grade_history_grade ON grade_history(grade_id);

-- Escala por defecto (sistema ecuatoriano 0-10)
INSERT INTO grade_scales (institution_id, name, scale_type, min_value, max_value, pass_value, is_default, active)
SELECT id, 'Escala Ecuatoriana', 'NUMERIC_10', 0, 10, 7, TRUE, TRUE
FROM institutions
WHERE NOT EXISTS (SELECT 1 FROM grade_scales WHERE institution_id = institutions.id AND is_default = TRUE);
