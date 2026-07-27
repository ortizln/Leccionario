-- V40: Extend academic_periods + add rubrics, competencias, recoveries/supletorios

-- Extend existing academic_periods table with new columns
ALTER TABLE academic_periods ADD COLUMN IF NOT EXISTS institution_id BIGINT;
ALTER TABLE academic_periods ADD COLUMN IF NOT EXISTS code VARCHAR(20);
ALTER TABLE academic_periods ADD COLUMN IF NOT EXISTS period_type VARCHAR(30) DEFAULT 'BIMESTRE';
ALTER TABLE academic_periods ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_academic_periods_institution ON academic_periods(institution_id);
CREATE INDEX IF NOT EXISTS idx_academic_periods_dates ON academic_periods(start_date, end_date);

CREATE TABLE IF NOT EXISTS rubrics (
    id BIGSERIAL PRIMARY KEY,
    institution_id BIGINT NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    criteria JSONB NOT NULL DEFAULT '[]',
    total_points NUMERIC(5,2) DEFAULT 100,
    created_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS competencies (
    id BIGSERIAL PRIMARY KEY,
    institution_id BIGINT NOT NULL,
    code VARCHAR(20) NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    competency_type VARCHAR(30) NOT NULL DEFAULT 'GENERALES',
    area VARCHAR(100),
    grade_level VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS recovery_exams (
    id BIGSERIAL PRIMARY KEY,
    institution_id BIGINT NOT NULL,
    student_id BIGINT NOT NULL,
    course_id BIGINT NOT NULL,
    subject_id BIGINT NOT NULL,
    original_evaluation_id BIGINT,
    exam_type VARCHAR(30) NOT NULL DEFAULT 'SUPLETORIO',
    scheduled_date DATE NOT NULL,
    score NUMERIC(5,2),
    status VARCHAR(20) DEFAULT 'PENDIENTE',
    notes TEXT,
    created_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_rubrics_institution ON rubrics(institution_id);
CREATE INDEX IF NOT EXISTS idx_competencies_institution ON competencies(institution_id);
CREATE INDEX IF NOT EXISTS idx_competencies_type ON competencies(competency_type);
CREATE INDEX IF NOT EXISTS idx_recovery_exams_institution ON recovery_exams(institution_id);
CREATE INDEX IF NOT EXISTS idx_recovery_exams_student ON recovery_exams(student_id);
CREATE INDEX IF NOT EXISTS idx_recovery_exams_status ON recovery_exams(status);
