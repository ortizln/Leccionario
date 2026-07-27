-- ============================================================================
-- V21: MATRICULAS, NEE, ADAPTACIONES CURRICULARES, DECE
-- ============================================================================

-- ============================================================================
-- MATRICULAS (enrollment per academic period)
-- ============================================================================

CREATE TABLE enrollments (
    id                  BIGSERIAL PRIMARY KEY,
    student_id          BIGINT NOT NULL REFERENCES students(id),
    course_id           BIGINT NOT NULL REFERENCES courses(id),
    period_id           BIGINT NOT NULL REFERENCES periods(id),
    enrollment_number   VARCHAR(20) NOT NULL,
    parallel_code       VARCHAR(5),
    status              VARCHAR(15) NOT NULL DEFAULT 'ACTIVE'
                        CHECK (status IN ('ACTIVE', 'TRANSFERRED', 'WITHDRAWN', 'PROMOTED')),
    enrollment_date     DATE NOT NULL DEFAULT CURRENT_DATE,
    withdrawal_date     DATE,
    observations        TEXT,
    created_by          VARCHAR(100),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_enrollment_number UNIQUE (enrollment_number),
    CONSTRAINT uq_enrollment_student_period UNIQUE (student_id, period_id)
);

CREATE INDEX idx_enrollments_student ON enrollments(student_id);
CREATE INDEX idx_enrollments_course ON enrollments(course_id);
CREATE INDEX idx_enrollments_period ON enrollments(period_id);
CREATE INDEX idx_enrollments_status ON enrollments(status);

-- ============================================================================
-- NEE (Necesidades Educativas Especiales)
-- ============================================================================

CREATE TABLE special_needs (
    id                  BIGSERIAL PRIMARY KEY,
    student_id          BIGINT NOT NULL REFERENCES students(id),
    diagnosis           VARCHAR(300) NOT NULL,
    diagnosis_date      DATE,
    need_type           VARCHAR(30) NOT NULL
                        CHECK (need_type IN ('COGNITIVA', 'SENSORIAL', 'MOTRIZ', 'COMUNICATIVA', 'EMOCIONAL', 'MULTIPLE')),
    severity            VARCHAR(15) NOT NULL DEFAULT 'MODERADA'
                        CHECK (severity IN ('LEVE', 'MODERADA', 'SEVERA', 'GRAVE')),
    description         TEXT,
    professional        VARCHAR(200),
    professional_contact VARCHAR(150),
    iep_summary         TEXT,
    status              VARCHAR(15) NOT NULL DEFAULT 'ACTIVA'
                        CHECK (status IN ('ACTIVA', 'EN_SEGUIMIENTO', 'CERRADA')),
    created_by          VARCHAR(100),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_special_needs_student ON special_needs(student_id);
CREATE INDEX idx_special_needs_type ON special_needs(need_type);
CREATE INDEX idx_special_needs_status ON special_needs(status);

-- ============================================================================
-- ADAPTACIONES CURRICULARES (linked to NEE)
-- ============================================================================

CREATE TABLE curricular_adaptations (
    id                  BIGSERIAL PRIMARY KEY,
    special_needs_id    BIGINT NOT NULL REFERENCES special_needs(id),
    student_id          BIGINT NOT NULL REFERENCES students(id),
    subject_id          BIGINT REFERENCES subjects(id),
    adaptation_type     VARCHAR(25) NOT NULL
                        CHECK (adaptation_type IN ('ACCOMMODATION', 'MODIFICATION', 'AUXILIARY_SUPPORT', 'TOTAL')),
    area                VARCHAR(100),
    description         TEXT NOT NULL,
    goals               TEXT,
    strategies          TEXT,
    evaluation_adjustments TEXT,
    period_id           BIGINT REFERENCES periods(id),
    status              VARCHAR(15) NOT NULL DEFAULT 'ACTIVE'
                        CHECK (status IN ('ACTIVE', 'REVIEWED', 'COMPLETED')),
    created_by          VARCHAR(100),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_curricular_adaptations_student ON curricular_adaptations(student_id);
CREATE INDEX idx_curricular_adaptations_nee ON curricular_adaptations(special_needs_id);
CREATE INDEX idx_curricular_adaptations_subject ON curricular_adaptations(subject_id);

-- ============================================================================
-- DECE (Departamento de Consejeria Estudiantil)
-- ============================================================================

CREATE TABLE dece_cases (
    id                  BIGSERIAL PRIMARY KEY,
    student_id          BIGINT NOT NULL REFERENCES students(id),
    case_type           VARCHAR(30) NOT NULL
                        CHECK (case_type IN ('ACADEMICA', 'EMOCIONAL', 'COMPORTAMIENTO', 'FAMILIAR', 'VIOLENCIA', 'BULLYING', 'OTRA')),
    priority            VARCHAR(10) NOT NULL DEFAULT 'NORMAL'
                        CHECK (priority IN ('BAJA', 'NORMAL', 'ALTA', 'URGENTE')),
    description         TEXT NOT NULL,
    counselor_name      VARCHAR(200),
    interventions       TEXT,
    follow_up_notes     TEXT,
    status              VARCHAR(20) NOT NULL DEFAULT 'ABIERTO'
                        CHECK (status IN ('ABIERTO', 'EN_PROCESO', 'CERRADO', 'REFERIDO')),
    open_date           DATE NOT NULL DEFAULT CURRENT_DATE,
    close_date          DATE,
    result              TEXT,
    created_by          VARCHAR(100),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_dece_cases_student ON dece_cases(student_id);
CREATE INDEX idx_dece_cases_type ON dece_cases(case_type);
CREATE INDEX idx_dece_cases_status ON dece_cases(status);
CREATE INDEX idx_dece_cases_priority ON dece_cases(priority);

CREATE TABLE dece_follow_ups (
    id                  BIGSERIAL PRIMARY KEY,
    case_id             BIGINT NOT NULL REFERENCES dece_cases(id) ON DELETE CASCADE,
    date                DATE NOT NULL DEFAULT CURRENT_DATE,
    notes               TEXT NOT NULL,
    actions_taken       TEXT,
    next_steps          TEXT,
    created_by          VARCHAR(100),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_dece_follow_ups_case ON dece_follow_ups(case_id);
