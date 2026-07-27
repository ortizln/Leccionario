-- V20: Banco de Preguntas

-- 1. Categorias de preguntas
CREATE TABLE question_categories (
    id              BIGSERIAL PRIMARY KEY,
    institution_id  BIGINT NOT NULL REFERENCES institutions(id),
    name            VARCHAR(150) NOT NULL,
    description     VARCHAR(300),
    active          BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_question_category_name_inst UNIQUE (institution_id, name)
);

-- 2. Preguntas
CREATE TABLE questions (
    id                  BIGSERIAL PRIMARY KEY,
    institution_id      BIGINT NOT NULL REFERENCES institutions(id),
    subject_id          BIGINT NOT NULL REFERENCES subjects(id),
    category_id         BIGINT REFERENCES question_categories(id),
    question_type       VARCHAR(20) NOT NULL DEFAULT 'OPEN'
                        CHECK (question_type IN ('OPEN', 'MULTIPLE_CHOICE', 'TRUE_FALSE', 'FILL_BLANK', 'ESSAY')),
    difficulty          VARCHAR(15) NOT NULL DEFAULT 'MEDIUM'
                        CHECK (difficulty IN ('EASY', 'MEDIUM', 'HARD')),
    question_text       TEXT NOT NULL,
    correct_answer      TEXT,
    option_a            VARCHAR(500),
    option_b            VARCHAR(500),
    option_c            VARCHAR(500),
    option_d            VARCHAR(500),
    explanation         TEXT,
    points              DECIMAL(5,2) DEFAULT 1.00,
    tags                VARCHAR(300),
    created_by          VARCHAR(100),
    active              BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indices
CREATE INDEX idx_question_categories_institution ON question_categories(institution_id);
CREATE INDEX idx_questions_institution ON questions(institution_id);
CREATE INDEX idx_questions_subject ON questions(subject_id);
CREATE INDEX idx_questions_category ON questions(category_id);
CREATE INDEX idx_questions_type ON questions(question_type);
CREATE INDEX idx_questions_difficulty ON questions(difficulty);
