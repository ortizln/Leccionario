-- V37: Create AI learning styles and study plans tables

CREATE TABLE ai_learning_styles (
    id BIGSERIAL PRIMARY KEY,
    student_id BIGINT NOT NULL,
    institution_id BIGINT NOT NULL,
    dominant_style VARCHAR(50) DEFAULT 'VISUAL',
    visual_score DECIMAL(5,4) DEFAULT 0,
    auditory_score DECIMAL(5,4) DEFAULT 0,
    kinesthetic_score DECIMAL(5,4) DEFAULT 0,
    reading_score DECIMAL(5,4) DEFAULT 0,
    assessment_count INTEGER DEFAULT 0,
    observations TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, institution_id)
);

CREATE TABLE ai_study_plans (
    id BIGSERIAL PRIMARY KEY,
    student_id BIGINT NOT NULL,
    institution_id BIGINT NOT NULL,
    title VARCHAR(200),
    description TEXT,
    objectives TEXT,
    activities TEXT,
    resources TEXT,
    status VARCHAR(30) DEFAULT 'DRAFT',
    start_date DATE,
    end_date DATE,
    progress_percent DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ai_ls_student ON ai_learning_styles(student_id);
CREATE INDEX idx_ai_ls_institution ON ai_learning_styles(institution_id);
CREATE INDEX idx_ai_sp_student ON ai_study_plans(student_id);
CREATE INDEX idx_ai_sp_institution ON ai_study_plans(institution_id);
CREATE INDEX idx_ai_sp_status ON ai_study_plans(status);
