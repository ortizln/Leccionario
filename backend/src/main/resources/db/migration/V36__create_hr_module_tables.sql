-- V36: Create HR module tables (vacancies, training content, employee actions, benefits)

CREATE TABLE vacancies (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    department VARCHAR(50) NOT NULL,
    position_type VARCHAR(50) DEFAULT 'FULL_TIME',
    status VARCHAR(50) DEFAULT 'OPEN',
    positions_available INTEGER DEFAULT 1,
    published_date DATE DEFAULT CURRENT_DATE,
    closing_date DATE,
    requirements VARCHAR(500),
    institution_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE training_contents (
    id BIGSERIAL PRIMARY KEY,
    course_id BIGINT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description VARCHAR(1000),
    content_type VARCHAR(30) DEFAULT 'LESSON',
    sort_order INTEGER DEFAULT 0,
    content TEXT,
    resource_url VARCHAR(500),
    duration_minutes INTEGER,
    institution_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE employee_actions (
    id BIGSERIAL PRIMARY KEY,
    employee_id BIGINT NOT NULL,
    action_type VARCHAR(50) NOT NULL,
    description VARCHAR(500) NOT NULL,
    action_date DATE DEFAULT CURRENT_DATE,
    observations VARCHAR(500),
    severity VARCHAR(50) DEFAULT 'LEVE',
    institution_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE employee_benefits (
    id BIGSERIAL PRIMARY KEY,
    employee_id BIGINT NOT NULL,
    benefit_type VARCHAR(100) NOT NULL,
    description VARCHAR(200) NOT NULL,
    value DECIMAL(10,2) NOT NULL,
    frequency VARCHAR(20) DEFAULT 'MONTHLY',
    is_active BOOLEAN DEFAULT TRUE,
    institution_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_vacancies_institution ON vacancies(institution_id);
CREATE INDEX idx_vacancies_status ON vacancies(status);
CREATE INDEX idx_training_contents_course ON training_contents(course_id);
CREATE INDEX idx_employee_actions_employee ON employee_actions(employee_id);
CREATE INDEX idx_employee_actions_institution ON employee_actions(institution_id);
CREATE INDEX idx_employee_benefits_employee ON employee_benefits(employee_id);
CREATE INDEX idx_employee_benefits_institution ON employee_benefits(institution_id);
