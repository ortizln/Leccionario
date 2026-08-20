-- ============================================================================
-- LECCIONARIO - Schema completo generado desde entidades JPA
-- PostgreSQL 15+
-- Generado: 2026-08-02 - 130 entidades, 26 modulos
-- ============================================================================

-- ============================================================================
-- 1. INSTITUCIONES Y USUARIOS
-- ============================================================================

CREATE TABLE institutions (
    id              BIGSERIAL PRIMARY KEY,
    name            VARCHAR(200) NOT NULL,
    code            VARCHAR(13) NOT NULL UNIQUE,
    district        VARCHAR(120) NOT NULL,
    circuit         VARCHAR(120) NOT NULL,
    address         VARCHAR(200) NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE academic_years (
    id              BIGSERIAL PRIMARY KEY,
    year            INTEGER NOT NULL UNIQUE,
    active          BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE school_days (
    id              BIGSERIAL PRIMARY KEY,
    name            VARCHAR(50) NOT NULL UNIQUE,
    active          BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE school_modalities (
    id              BIGSERIAL PRIMARY KEY,
    name            VARCHAR(50) NOT NULL UNIQUE,
    active          BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE schedule_blocks (
    id              BIGSERIAL PRIMARY KEY,
    label           VARCHAR(80) NOT NULL,
    start_time      TIME NOT NULL,
    end_time        TIME NOT NULL,
    block_order     INTEGER NOT NULL,
    block_type      VARCHAR(20) NOT NULL,
    active          BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE roles (
    id              BIGSERIAL PRIMARY KEY,
    name            VARCHAR(50) NOT NULL UNIQUE,
    description     VARCHAR(120) NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE role_permissions (
    role_id         BIGINT NOT NULL REFERENCES roles(id),
    permission_code VARCHAR(80) NOT NULL,
    PRIMARY KEY (role_id, permission_code)
);

CREATE TABLE users (
    id              BIGSERIAL PRIMARY KEY,
    username        VARCHAR(20) NOT NULL UNIQUE,
    email           VARCHAR(120) NOT NULL UNIQUE,
    password        VARCHAR(255) NOT NULL,
    identification  VARCHAR(20) NOT NULL,
    first_name      VARCHAR(150) NOT NULL,
    last_name       VARCHAR(150) NOT NULL,
    enabled         BOOLEAN NOT NULL DEFAULT TRUE,
    institution_id  BIGINT NOT NULL REFERENCES institutions(id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE user_roles (
    user_id         BIGINT NOT NULL REFERENCES users(id),
    role_id         BIGINT NOT NULL REFERENCES roles(id),
    PRIMARY KEY (user_id, role_id)
);

CREATE TABLE teachers (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL UNIQUE REFERENCES users(id),
    specialization  VARCHAR(120) NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE teacher_subjects (
    teacher_id      BIGINT NOT NULL REFERENCES teachers(id),
    subject_name    VARCHAR(200),
    PRIMARY KEY (teacher_id, subject_name)
);

CREATE TABLE teacher_courses (
    teacher_id      BIGINT NOT NULL REFERENCES teachers(id),
    course_name     VARCHAR(200),
    PRIMARY KEY (teacher_id, course_name)
);

CREATE TABLE courses (
    id                  BIGSERIAL PRIMARY KEY,
    name                VARCHAR(100) NOT NULL,
    parallel            VARCHAR(5) NOT NULL,
    level               VARCHAR(50) NOT NULL,
    section             VARCHAR(20),
    sub_level           VARCHAR(20),
    grade               INTEGER,
    week_student_id     BIGINT REFERENCES students(id),
    academic_year_id    BIGINT REFERENCES academic_years(id),
    school_day_id       BIGINT REFERENCES school_days(id),
    school_modality_id  BIGINT REFERENCES school_modalities(id),
    capacity            INTEGER,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE students (
    id                  BIGSERIAL PRIMARY KEY,
    user_id             BIGINT NOT NULL UNIQUE REFERENCES users(id),
    course_id           BIGINT NOT NULL REFERENCES courses(id),
    enrollment_number   VARCHAR(30) NOT NULL,
    birth_date          DATE,
    gender              VARCHAR(5),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Now add FK that was deferred
ALTER TABLE courses ADD CONSTRAINT fk_courses_week_student FOREIGN KEY (week_student_id) REFERENCES students(id);

CREATE TABLE representatives (
    id                  BIGSERIAL PRIMARY KEY,
    student_id          BIGINT,
    full_name           VARCHAR(200) NOT NULL,
    relationship        VARCHAR(50) NOT NULL,
    phone               VARCHAR(20) NOT NULL,
    email               VARCHAR(120),
    emergency_contact   VARCHAR(200),
    emergency_phone     VARCHAR(20),
    address             VARCHAR(300),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 2. INSTITUCION - CAMPUS, AULAS, TURNOS, CONFIG
-- ============================================================================

CREATE TABLE campus (
    id              BIGSERIAL PRIMARY KEY,
    institution_id  BIGINT NOT NULL REFERENCES institutions(id),
    name            VARCHAR(200) NOT NULL,
    code            VARCHAR(20),
    address         VARCHAR(300),
    latitude        NUMERIC(10,7),
    longitude       NUMERIC(10,7),
    phone           VARCHAR(20),
    email           VARCHAR(150),
    campus_type     VARCHAR(20) NOT NULL DEFAULT 'PRINCIPAL',
    active          BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE shifts (
    id              BIGSERIAL PRIMARY KEY,
    institution_id  BIGINT NOT NULL REFERENCES institutions(id),
    name            VARCHAR(100) NOT NULL,
    code            VARCHAR(10) NOT NULL,
    start_time      TIME NOT NULL,
    end_time        TIME NOT NULL,
    shift_type      VARCHAR(15) NOT NULL DEFAULT 'REGULAR',
    active          BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE classrooms (
    id              BIGSERIAL PRIMARY KEY,
    institution_id  BIGINT NOT NULL REFERENCES institutions(id),
    campus_id       BIGINT REFERENCES campus(id),
    shift_id        BIGINT REFERENCES shifts(id),
    name            VARCHAR(100) NOT NULL,
    code            VARCHAR(20) NOT NULL,
    classroom_type  VARCHAR(20) NOT NULL DEFAULT 'AULA',
    capacity        INTEGER NOT NULL DEFAULT 0,
    floor           VARCHAR(10),
    wing            VARCHAR(10),
    has_projector   BOOLEAN DEFAULT FALSE,
    has_computers   BOOLEAN DEFAULT FALSE,
    computer_count  INTEGER DEFAULT 0,
    has_internet    BOOLEAN DEFAULT FALSE,
    active          BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE academic_periods (
    id              BIGSERIAL PRIMARY KEY,
    institution_id  BIGINT,
    name            VARCHAR(120) NOT NULL,
    code            VARCHAR(20),
    period_type     VARCHAR(30) DEFAULT 'BIMESTRE',
    start_date      DATE NOT NULL,
    end_date        DATE NOT NULL,
    active          BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE institution_settings (
    id              BIGSERIAL PRIMARY KEY,
    institution_id  BIGINT NOT NULL REFERENCES institutions(id),
    setting_key     VARCHAR(100) NOT NULL,
    setting_value   TEXT,
    setting_type    VARCHAR(15) NOT NULL DEFAULT 'STRING',
    category        VARCHAR(50),
    description     VARCHAR(300),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE school_calendar_events (
    id                  BIGSERIAL PRIMARY KEY,
    institution_id      BIGINT NOT NULL REFERENCES institutions(id),
    academic_year_id    BIGINT REFERENCES academic_years(id),
    event_name          VARCHAR(200) NOT NULL,
    event_type          VARCHAR(20) NOT NULL,
    start_date          DATE NOT NULL,
    end_date            DATE NOT NULL,
    description         TEXT,
    is_recurrent         BOOLEAN DEFAULT FALSE,
    recurrence_rule     VARCHAR(100),
    color               VARCHAR(7),
    active              BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 3. ACADEMICO - MATERIAS, ASIGNACIONES
-- ============================================================================

CREATE TABLE subjects (
    id              BIGSERIAL PRIMARY KEY,
    name            VARCHAR(150) NOT NULL,
    code            VARCHAR(30) NOT NULL UNIQUE,
    curriculum_area VARCHAR(255) NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE week_student_assignments (
    id              BIGSERIAL PRIMARY KEY,
    course_id       BIGINT NOT NULL REFERENCES courses(id),
    student_id      BIGINT NOT NULL REFERENCES students(id),
    start_date      DATE NOT NULL,
    end_date        DATE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 4. EVALUACIONES
-- ============================================================================

CREATE TABLE evaluation_types (
    id              BIGSERIAL PRIMARY KEY,
    institution_id  BIGINT NOT NULL REFERENCES institutions(id),
    name            VARCHAR(100) NOT NULL,
    code            VARCHAR(30) NOT NULL,
    description     VARCHAR(300),
    weight_pct      NUMERIC(5,2) NOT NULL DEFAULT 100.00,
    active          BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE grade_scales (
    id              BIGSERIAL PRIMARY KEY,
    institution_id  BIGINT NOT NULL REFERENCES institutions(id),
    name            VARCHAR(100) NOT NULL,
    scale_type      VARCHAR(20) NOT NULL,
    min_value       NUMERIC(5,2) NOT NULL,
    max_value       NUMERIC(5,2) NOT NULL,
    pass_value      NUMERIC(5,2) NOT NULL,
    is_default      BOOLEAN NOT NULL DEFAULT FALSE,
    active          BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE lesson_plans (
    id                      BIGSERIAL PRIMARY KEY,
    lesson_date             DATE NOT NULL,
    teacher_id              BIGINT NOT NULL REFERENCES teachers(id),
    subject_id              BIGINT NOT NULL REFERENCES subjects(id),
    course_id               BIGINT NOT NULL REFERENCES courses(id),
    period_id               BIGINT NOT NULL REFERENCES academic_periods(id),
    topic                   VARCHAR(250) NOT NULL,
    objective               VARCHAR(500) NOT NULL,
    activities              TEXT NOT NULL,
    resources               TEXT NOT NULL,
    observations            VARCHAR(1000),
    curriculum_completed    BOOLEAN NOT NULL DEFAULT FALSE,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE evaluations (
    id                  BIGSERIAL PRIMARY KEY,
    lesson_plan_id      BIGINT NOT NULL REFERENCES lesson_plans(id),
    student_id          BIGINT NOT NULL REFERENCES students(id),
    evaluation_type     VARCHAR(120) NOT NULL,
    score               NUMERIC(5,2) NOT NULL,
    feedback            VARCHAR(500),
    evaluation_type_id  BIGINT REFERENCES evaluation_types(id),
    evaluation_date     DATE,
    weight              NUMERIC(5,2) DEFAULT 1.00,
    max_score           NUMERIC(5,2) DEFAULT 10.00,
    scale_id            BIGINT REFERENCES grade_scales(id),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE grades (
    id              BIGSERIAL PRIMARY KEY,
    evaluation_id   BIGINT NOT NULL REFERENCES evaluations(id),
    student_id      BIGINT NOT NULL REFERENCES students(id),
    score           NUMERIC(5,2) NOT NULL,
    comment         VARCHAR(500),
    graded_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    graded_by       VARCHAR(100),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE grade_history (
    id              BIGSERIAL PRIMARY KEY,
    grade_id        BIGINT NOT NULL REFERENCES grades(id),
    old_score       NUMERIC(5,2),
    new_score       NUMERIC(5,2) NOT NULL,
    changed_by      VARCHAR(100) NOT NULL,
    changed_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reason          VARCHAR(300)
);

CREATE TABLE period_grades (
    id                  BIGSERIAL PRIMARY KEY,
    student_id          BIGINT NOT NULL REFERENCES students(id),
    course_id           BIGINT NOT NULL REFERENCES courses(id),
    subject_id          BIGINT NOT NULL REFERENCES subjects(id),
    academic_period_id  BIGINT NOT NULL REFERENCES academic_periods(id),
    average_score       NUMERIC(5,2),
    status              VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    teacher_notes       VARCHAR(500),
    calculated_at       TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (student_id, course_id, subject_id, academic_period_id)
);

CREATE TABLE competencies (
    id              BIGSERIAL PRIMARY KEY,
    institution_id  BIGINT NOT NULL,
    code            VARCHAR(20) NOT NULL,
    name            VARCHAR(200) NOT NULL,
    description     TEXT,
    competency_type VARCHAR(30) NOT NULL DEFAULT 'GENERALES',
    area            VARCHAR(100),
    grade_level     VARCHAR(50),
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE recovery_exams (
    id                      BIGSERIAL PRIMARY KEY,
    institution_id          BIGINT NOT NULL,
    student_id              BIGINT NOT NULL,
    course_id               BIGINT NOT NULL,
    subject_id              BIGINT NOT NULL,
    original_evaluation_id  BIGINT,
    exam_type               VARCHAR(30) NOT NULL DEFAULT 'SUPLETORIO',
    scheduled_date          DATE NOT NULL,
    score                   NUMERIC(5,2),
    status                  VARCHAR(20) DEFAULT 'PENDIENTE',
    notes                   TEXT,
    created_by              VARCHAR(100),
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE report_cards (
    id                  BIGSERIAL PRIMARY KEY,
    student_id          BIGINT NOT NULL REFERENCES students(id),
    course_id           BIGINT NOT NULL REFERENCES courses(id),
    academic_period_id  BIGINT NOT NULL REFERENCES academic_periods(id),
    status              VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    overall_average     NUMERIC(5,2),
    final_status        VARCHAR(20),
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
    UNIQUE (student_id, course_id, academic_period_id)
);

CREATE TABLE report_card_details (
    id                  BIGSERIAL PRIMARY KEY,
    report_card_id      BIGINT NOT NULL REFERENCES report_cards(id),
    subject_id          BIGINT NOT NULL REFERENCES subjects(id),
    teacher_id          BIGINT NOT NULL REFERENCES teachers(id),
    average_score       NUMERIC(5,2),
    status              VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    teacher_comment     VARCHAR(500),
    evaluation_count    INTEGER DEFAULT 0,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (report_card_id, subject_id)
);

CREATE TABLE rubrics (
    id              BIGSERIAL PRIMARY KEY,
    institution_id  BIGINT NOT NULL,
    name            VARCHAR(200) NOT NULL,
    description     TEXT,
    criteria        JSONB DEFAULT '[]',
    total_points    NUMERIC(5,2) DEFAULT 100.00,
    created_by      VARCHAR(100),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 5. HORARIOS
-- ============================================================================

CREATE TABLE course_schedules (
    id                  BIGSERIAL PRIMARY KEY,
    course_id           BIGINT NOT NULL REFERENCES courses(id),
    period_id           BIGINT NOT NULL REFERENCES academic_periods(id),
    schedule_block_id   BIGINT NOT NULL REFERENCES schedule_blocks(id),
    subject_id          BIGINT NOT NULL REFERENCES subjects(id),
    teacher_id          BIGINT NOT NULL REFERENCES teachers(id),
    weekday             SMALLINT NOT NULL,
    classroom           VARCHAR(80),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 6. MATRICULA
-- ============================================================================

CREATE TABLE enrollments (
    id                  BIGSERIAL PRIMARY KEY,
    student_id          BIGINT NOT NULL,
    course_id           BIGINT NOT NULL,
    period_id           BIGINT NOT NULL,
    enrollment_number   VARCHAR(20) NOT NULL,
    parallel_code       VARCHAR(5),
    status              VARCHAR(15) NOT NULL DEFAULT 'ACTIVE',
    enrollment_date     DATE NOT NULL DEFAULT CURRENT_DATE,
    withdrawal_date     DATE,
    observations        TEXT,
    created_by          VARCHAR(100),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (student_id, period_id)
);

-- ============================================================================
-- 7. BITACORA DIARIA
-- ============================================================================

CREATE TABLE daily_logs (
    id              BIGSERIAL PRIMARY KEY,
    institution_id  BIGINT NOT NULL REFERENCES institutions(id),
    course_id       BIGINT NOT NULL REFERENCES courses(id),
    period_id       BIGINT NOT NULL REFERENCES academic_periods(id),
    work_day_number INTEGER,
    log_date        DATE NOT NULL,
    city            VARCHAR(120),
    general_notes   TEXT,
    close_token     VARCHAR(80) NOT NULL UNIQUE,
    status          VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    closed_at       TIMESTAMP,
    created_by      BIGINT NOT NULL REFERENCES users(id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE daily_log_entries (
    id                          BIGSERIAL PRIMARY KEY,
    daily_log_id                BIGINT NOT NULL REFERENCES daily_logs(id),
    schedule_block_id           BIGINT NOT NULL REFERENCES schedule_blocks(id),
    teacher_id                  BIGINT REFERENCES teachers(id),
    subject_id                  BIGINT REFERENCES subjects(id),
    didactic_unit               VARCHAR(250),
    topic                       VARCHAR(300),
    close_token                 VARCHAR(80) NOT NULL UNIQUE,
    teacher_signature_status    VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    teacher_closed_at           TIMESTAMP,
    specific_notes              TEXT,
    general_notes               TEXT,
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE daily_log_signatures (
    id              BIGSERIAL PRIMARY KEY,
    daily_log_id    BIGINT NOT NULL REFERENCES daily_logs(id),
    signer_user_id  BIGINT NOT NULL REFERENCES users(id),
    signer_role     VARCHAR(40) NOT NULL,
    signature_type  VARCHAR(30) NOT NULL,
    signed_at       TIMESTAMP NOT NULL,
    notes           VARCHAR(300),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE daily_log_student_absences (
    id                  BIGSERIAL PRIMARY KEY,
    daily_log_entry_id  BIGINT NOT NULL REFERENCES daily_log_entries(id),
    student_id          BIGINT NOT NULL REFERENCES students(id),
    absence_type        VARCHAR(20) NOT NULL DEFAULT 'ABSENT',
    notes               VARCHAR(300),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE daily_log_student_incidents (
    id                  BIGSERIAL PRIMARY KEY,
    daily_log_entry_id  BIGINT NOT NULL REFERENCES daily_log_entries(id),
    student_id          BIGINT NOT NULL REFERENCES students(id),
    demerit_id          BIGINT,
    category            VARCHAR(80) NOT NULL,
    notes               VARCHAR(400),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (daily_log_entry_id, student_id)
);

-- ============================================================================
-- 8. CONDUCTA - DEMERITOS Y MERITOS
-- ============================================================================

CREATE TABLE merit_categories (
    id              BIGSERIAL PRIMARY KEY,
    institution_id  BIGINT NOT NULL REFERENCES institutions(id),
    name            VARCHAR(100) NOT NULL,
    description     VARCHAR(300),
    merit_points    INTEGER NOT NULL DEFAULT 1,
    active          BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (institution_id, name)
);

CREATE TABLE student_merits (
    id                  BIGSERIAL PRIMARY KEY,
    institution_id      BIGINT NOT NULL REFERENCES institutions(id),
    student_id          BIGINT NOT NULL REFERENCES students(id),
    course_id           BIGINT NOT NULL REFERENCES courses(id),
    academic_period_id  BIGINT NOT NULL REFERENCES academic_periods(id),
    category_id         BIGINT NOT NULL REFERENCES merit_categories(id),
    merit_date          DATE NOT NULL,
    points              INTEGER NOT NULL DEFAULT 1,
    description         VARCHAR(500),
    registered_by       VARCHAR(100),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE demerits (
    id              BIGSERIAL PRIMARY KEY,
    code            VARCHAR(20) UNIQUE,
    category        VARCHAR(120) NOT NULL,
    description     VARCHAR(500) NOT NULL,
    score           SMALLINT NOT NULL,
    active          BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE demerit_categories (
    id              BIGSERIAL PRIMARY KEY,
    code            VARCHAR(20) NOT NULL UNIQUE,
    name            VARCHAR(150) NOT NULL,
    description     VARCHAR(500),
    display_order   SMALLINT NOT NULL DEFAULT 0,
    active          BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE demerit_faltas (
    id                          BIGSERIAL PRIMARY KEY,
    category_id                 BIGINT NOT NULL REFERENCES demerit_categories(id),
    code                        VARCHAR(20) NOT NULL,
    description                 VARCHAR(500) NOT NULL,
    score                       SMALLINT NOT NULL,
    severity                    VARCHAR(20) NOT NULL DEFAULT 'MEDIA',
    requires_observation        BOOLEAN NOT NULL DEFAULT FALSE,
    requires_evidence           BOOLEAN NOT NULL DEFAULT FALSE,
    requires_representative     BOOLEAN NOT NULL DEFAULT FALSE,
    active                      BOOLEAN NOT NULL DEFAULT TRUE,
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (category_id, code)
);

CREATE TABLE student_demers (
    id              BIGSERIAL PRIMARY KEY,
    student_id      BIGINT NOT NULL REFERENCES students(id),
    period_id       BIGINT NOT NULL REFERENCES academic_periods(id),
    course_id       BIGINT REFERENCES courses(id),
    teacher_id      BIGINT REFERENCES teachers(id),
    log_date        DATE NOT NULL,
    observation     VARCHAR(1000),
    total_score     SMALLINT NOT NULL DEFAULT 0,
    status          VARCHAR(30) NOT NULL DEFAULT 'CREADO',
    created_by      VARCHAR(100),
    updated_by      VARCHAR(100),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE student_demer_details (
    id              BIGSERIAL PRIMARY KEY,
    student_demer_id BIGINT NOT NULL REFERENCES student_demers(id),
    falta_id        BIGINT NOT NULL REFERENCES demerit_faltas(id),
    quantity        SMALLINT NOT NULL DEFAULT 1,
    score           SMALLINT NOT NULL,
    subtotal        SMALLINT NOT NULL
);

CREATE TABLE demerit_evidences (
    id                  BIGSERIAL PRIMARY KEY,
    student_demer_id    BIGINT NOT NULL REFERENCES student_demers(id),
    file_name           VARCHAR(255) NOT NULL,
    file_path           VARCHAR(500) NOT NULL,
    file_type           VARCHAR(50),
    uploaded_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE demerit_status_history (
    id                  BIGSERIAL PRIMARY KEY,
    student_demer_id    BIGINT NOT NULL REFERENCES student_demers(id),
    changed_by          VARCHAR(100) NOT NULL,
    changed_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    previous_status     VARCHAR(30),
    new_status          VARCHAR(30) NOT NULL,
    notes               VARCHAR(500)
);

-- ============================================================================
-- 9. FINANZAS
-- ============================================================================

CREATE TABLE tuition_plans (
    id              BIGSERIAL PRIMARY KEY,
    institution_id  BIGINT NOT NULL,
    name            VARCHAR(150) NOT NULL,
    description     TEXT,
    amount          NUMERIC(12,2) NOT NULL,
    active          BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE cash_registers (
    id                  BIGSERIAL PRIMARY KEY,
    institution_id      BIGINT NOT NULL,
    register_date       DATE NOT NULL DEFAULT CURRENT_DATE,
    opening_balance     NUMERIC(12,2) NOT NULL DEFAULT 0,
    closing_balance     NUMERIC(12,2),
    total_income        NUMERIC(12,2) DEFAULT 0,
    total_expenses      NUMERIC(12,2) DEFAULT 0,
    status              VARCHAR(15) NOT NULL DEFAULT 'ABIERTA',
    opened_by           VARCHAR(100),
    closed_by           VARCHAR(100),
    opened_at           TIMESTAMP DEFAULT NOW(),
    closed_at           TIMESTAMP,
    notes               TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE cash_transactions (
    id                  BIGSERIAL PRIMARY KEY,
    register_id         BIGINT NOT NULL,
    transaction_type    VARCHAR(10) NOT NULL,
    category            VARCHAR(50),
    description         TEXT NOT NULL,
    amount              NUMERIC(12,2) NOT NULL,
    payment_method      VARCHAR(20) DEFAULT 'EFECTIVO',
    reference_number    VARCHAR(50),
    student_id          BIGINT,
    invoice_id          BIGINT,
    created_by          VARCHAR(100),
    created_at          TIMESTAMP DEFAULT NOW()
);

CREATE TABLE invoices (
    id                  BIGSERIAL PRIMARY KEY,
    institution_id      BIGINT NOT NULL,
    invoice_number      VARCHAR(30) NOT NULL,
    student_id          BIGINT NOT NULL,
    period_id           BIGINT,
    invoice_date        DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date            DATE,
    subtotal            NUMERIC(12,2) NOT NULL DEFAULT 0,
    iva_percent         NUMERIC(5,2) DEFAULT 12.00,
    iva_amount          NUMERIC(12,2) DEFAULT 0,
    total               NUMERIC(12,2) NOT NULL DEFAULT 0,
    paid_amount         NUMERIC(12,2) DEFAULT 0,
    status              VARCHAR(15) NOT NULL DEFAULT 'PENDIENTE',
    concept             VARCHAR(200),
    observations        TEXT,
    sri_auth_number     VARCHAR(50),
    sri_clave_acceso    VARCHAR(50),
    created_by          VARCHAR(100),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE invoice_items (
    id              BIGSERIAL PRIMARY KEY,
    invoice_id      BIGINT NOT NULL REFERENCES invoices(id),
    description     VARCHAR(300) NOT NULL,
    quantity        NUMERIC(8,2) NOT NULL DEFAULT 1,
    unit_price      NUMERIC(10,2) NOT NULL,
    subtotal        NUMERIC(12,2) NOT NULL,
    created_at      TIMESTAMP DEFAULT NOW()
);

CREATE TABLE credit_notes (
    id                  BIGSERIAL PRIMARY KEY,
    institution_id      BIGINT NOT NULL,
    note_number         VARCHAR(30) NOT NULL,
    invoice_id          BIGINT NOT NULL,
    student_id          BIGINT NOT NULL,
    note_date           DATE NOT NULL DEFAULT CURRENT_DATE,
    amount              NUMERIC(12,2) NOT NULL,
    reason              VARCHAR(100),
    observations        TEXT,
    sri_auth_number     VARCHAR(50),
    status              VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_by          VARCHAR(100),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE accounts_receivable (
    id                  BIGSERIAL PRIMARY KEY,
    institution_id      BIGINT NOT NULL,
    student_id          BIGINT NOT NULL,
    invoice_id          BIGINT,
    description         VARCHAR(200) NOT NULL,
    original_amount     NUMERIC(12,2) NOT NULL,
    paid_amount         NUMERIC(12,2) DEFAULT 0,
    due_date            DATE,
    status              VARCHAR(15) NOT NULL DEFAULT 'PENDIENTE',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE financial_discounts (
    id              BIGSERIAL PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,
    description     VARCHAR(300),
    discount_type   VARCHAR(30) NOT NULL,
    value           NUMERIC(10,2) NOT NULL,
    status          VARCHAR(30) DEFAULT 'ACTIVO',
    valid_from      DATE,
    valid_until     DATE,
    institution_id  BIGINT NOT NULL,
    student_id      BIGINT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE student_tuitions (
    id              BIGSERIAL PRIMARY KEY,
    student_id      BIGINT NOT NULL,
    plan_id         BIGINT NOT NULL,
    period_id       BIGINT NOT NULL,
    enrollment_id   BIGINT,
    total_amount    NUMERIC(12,2) NOT NULL,
    paid_amount     NUMERIC(12,2) DEFAULT 0,
    status          VARCHAR(15) NOT NULL DEFAULT 'ACTIVA',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE tuition_payments (
    id                  BIGSERIAL PRIMARY KEY,
    student_tuition_id  BIGINT NOT NULL,
    invoice_id          BIGINT,
    payment_date        DATE NOT NULL DEFAULT CURRENT_DATE,
    amount              NUMERIC(12,2) NOT NULL,
    payment_method      VARCHAR(20) DEFAULT 'EFECTIVO',
    reference_number    VARCHAR(50),
    notes               TEXT,
    created_by          VARCHAR(100),
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 10. BIBLIOTECA
-- ============================================================================

CREATE TABLE book_categories (
    id              BIGSERIAL PRIMARY KEY,
    institution_id  BIGINT NOT NULL REFERENCES institutions(id),
    name            VARCHAR(100) NOT NULL,
    description     VARCHAR(300),
    parent_id       BIGINT,
    active          BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE books (
    id                  BIGSERIAL PRIMARY KEY,
    title               VARCHAR(300) NOT NULL,
    author              VARCHAR(200),
    isbn                VARCHAR(20),
    category_id         BIGINT REFERENCES book_categories(id),
    publisher           VARCHAR(200),
    publication_year    INTEGER,
    edition             VARCHAR(50),
    total_copies        INTEGER NOT NULL DEFAULT 1,
    available_copies    INTEGER NOT NULL DEFAULT 1,
    location            VARCHAR(200),
    status              VARCHAR(20) NOT NULL DEFAULT 'ACTIVO',
    institution_id      BIGINT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE book_loans (
    id              BIGSERIAL PRIMARY KEY,
    book_id         BIGINT NOT NULL,
    student_id      BIGINT NOT NULL,
    loan_date       DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date        DATE NOT NULL,
    return_date     DATE,
    status          VARCHAR(20) NOT NULL DEFAULT 'ACTIVO',
    fine_amount     NUMERIC(8,2) DEFAULT 0,
    notes           TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE book_reservations (
    id              BIGSERIAL PRIMARY KEY,
    book_id         BIGINT NOT NULL,
    student_id      BIGINT NOT NULL,
    reservation_date DATE NOT NULL DEFAULT CURRENT_DATE,
    expiry_date     DATE NOT NULL,
    status          VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE',
    notes           TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE library_fines (
    id              BIGSERIAL PRIMARY KEY,
    loan_id         BIGINT NOT NULL,
    student_id      BIGINT NOT NULL,
    fine_date       DATE NOT NULL DEFAULT CURRENT_DATE,
    amount          NUMERIC(8,2) NOT NULL,
    reason          VARCHAR(200),
    paid            BOOLEAN NOT NULL DEFAULT FALSE,
    paid_date       DATE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 11. INVENTARIO
-- ============================================================================

CREATE TABLE asset_categories (
    id                  BIGSERIAL PRIMARY KEY,
    institution_id      BIGINT NOT NULL,
    name                VARCHAR(150) NOT NULL,
    description         TEXT,
    depreciation_rate   NUMERIC(5,2) DEFAULT 0,
    useful_life_years   INTEGER,
    active              BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE suppliers (
    id              BIGSERIAL PRIMARY KEY,
    name            VARCHAR(150) NOT NULL,
    ruc             VARCHAR(20),
    contact_name    VARCHAR(100),
    phone           VARCHAR(20),
    email           VARCHAR(100),
    address         VARCHAR(200),
    status          VARCHAR(30) DEFAULT 'ACTIVO',
    institution_id  BIGINT NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE assets (
    id                  BIGSERIAL PRIMARY KEY,
    institution_id      BIGINT NOT NULL,
    category_id         BIGINT NOT NULL,
    code                VARCHAR(30) NOT NULL,
    name                VARCHAR(200) NOT NULL,
    description         TEXT,
    serial_number       VARCHAR(100),
    brand               VARCHAR(100),
    model               VARCHAR(100),
    purchase_date       DATE,
    purchase_cost       NUMERIC(12,2),
    current_value       NUMERIC(12,2),
    condition_status    VARCHAR(20) NOT NULL DEFAULT 'BUENO',
    status              VARCHAR(15) NOT NULL DEFAULT 'DISPONIBLE',
    location            VARCHAR(200),
    classroom_id        BIGINT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE asset_custodians (
    id              BIGSERIAL PRIMARY KEY,
    asset_id        BIGINT NOT NULL REFERENCES assets(id),
    employee_id     BIGINT NOT NULL,
    assigned_date   DATE NOT NULL,
    returned_date   DATE,
    status          VARCHAR(20) DEFAULT 'ASIGNADO',
    observations    VARCHAR(300),
    institution_id  BIGINT NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE asset_maintenances (
    id                  BIGSERIAL PRIMARY KEY,
    asset_id            BIGINT NOT NULL,
    maintenance_type    VARCHAR(20) NOT NULL,
    description         TEXT NOT NULL,
    cost                NUMERIC(10,2) NOT NULL DEFAULT 0,
    scheduled_date      DATE,
    completed_date      DATE,
    status              VARCHAR(15) NOT NULL DEFAULT 'PENDIENTE',
    technician          VARCHAR(150),
    notes               TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE asset_warranties (
    id              BIGSERIAL PRIMARY KEY,
    asset_id        BIGINT NOT NULL,
    provider        VARCHAR(200) NOT NULL,
    start_date      DATE,
    end_date        DATE,
    warranty_type   VARCHAR(50) DEFAULT 'ESTANDAR',
    terms           TEXT,
    status          VARCHAR(20) DEFAULT 'VIGENTE',
    institution_id  BIGINT NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE purchase_orders (
    id                      BIGSERIAL PRIMARY KEY,
    order_number            VARCHAR(30) NOT NULL,
    supplier_id             BIGINT REFERENCES suppliers(id),
    order_date              DATE NOT NULL,
    expected_date           DATE,
    total_amount            NUMERIC(12,2) DEFAULT 0,
    status                  VARCHAR(30) DEFAULT 'PENDIENTE',
    description             VARCHAR(300),
    institution_id          BIGINT NOT NULL,
    requested_by_user_id    BIGINT NOT NULL,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE asset_assignments (
    id                  BIGSERIAL PRIMARY KEY,
    asset_id            BIGINT NOT NULL,
    assigned_to         VARCHAR(150),
    user_id             BIGINT,
    assignment_date     DATE NOT NULL DEFAULT CURRENT_DATE,
    return_date         DATE,
    status              VARCHAR(15) NOT NULL DEFAULT 'ACTIVA',
    notes               TEXT,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 12. RECURSOS HUMANOS
-- ============================================================================

CREATE TABLE employees (
    id                  BIGSERIAL PRIMARY KEY,
    user_id             BIGINT,
    institution_id      BIGINT NOT NULL,
    employee_number     VARCHAR(20) NOT NULL,
    first_name          VARCHAR(100) NOT NULL,
    last_name           VARCHAR(100) NOT NULL,
    identification      VARCHAR(20) NOT NULL,
    id_type             VARCHAR(15) NOT NULL DEFAULT 'CEDULA',
    birth_date          DATE,
    gender              VARCHAR(10),
    civil_status        VARCHAR(15),
    nationality         VARCHAR(50),
    province            VARCHAR(50),
    city                VARCHAR(50),
    address             VARCHAR(300),
    phone               VARCHAR(20),
    mobile              VARCHAR(20),
    email               VARCHAR(150),
    photo_url           VARCHAR(300),
    blood_type          VARCHAR(5),
    emergency_contact   VARCHAR(200),
    emergency_phone     VARCHAR(20),
    position            VARCHAR(150),
    department          VARCHAR(100),
    hire_date           DATE NOT NULL,
    status              VARCHAR(15) NOT NULL DEFAULT 'ACTIVO',
    notes               TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE employment_contracts (
    id                  BIGSERIAL PRIMARY KEY,
    employee_id         BIGINT NOT NULL,
    contract_number     VARCHAR(30) NOT NULL,
    contract_type       VARCHAR(20) NOT NULL DEFAULT 'INDEFINIDO',
    position            VARCHAR(150) NOT NULL,
    department          VARCHAR(100),
    salary              NUMERIC(10,2),
    salary_type         VARCHAR(15) NOT NULL DEFAULT 'MENSUAL',
    start_date          DATE NOT NULL,
    end_date            DATE,
    trial_period_days   INTEGER DEFAULT 90,
    status              VARCHAR(15) NOT NULL DEFAULT 'ACTIVO',
    termination_reason  TEXT,
    created_by          VARCHAR(100),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE employee_attendances (
    id                  BIGSERIAL PRIMARY KEY,
    employee_id         BIGINT NOT NULL REFERENCES employees(id),
    attendance_date     DATE NOT NULL,
    check_in_time       TIME,
    check_out_time      TIME,
    status              VARCHAR(20) DEFAULT 'PRESENTE',
    observations        VARCHAR(255),
    institution_id      BIGINT NOT NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE employee_actions (
    id              BIGSERIAL PRIMARY KEY,
    employee_id     BIGINT NOT NULL,
    action_type     VARCHAR(50) NOT NULL,
    description     VARCHAR(500) NOT NULL,
    action_date     DATE DEFAULT CURRENT_DATE,
    observations    VARCHAR(500),
    severity        VARCHAR(50) DEFAULT 'LEVE',
    institution_id  BIGINT NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE employee_benefits (
    id              BIGSERIAL PRIMARY KEY,
    employee_id     BIGINT NOT NULL,
    benefit_type    VARCHAR(100) NOT NULL,
    description     VARCHAR(200) NOT NULL,
    value           NUMERIC(10,2) NOT NULL,
    frequency       VARCHAR(20) DEFAULT 'MONTHLY',
    is_active       BOOLEAN DEFAULT TRUE,
    institution_id  BIGINT NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE employee_evaluations (
    id                      BIGSERIAL PRIMARY KEY,
    employee_id             BIGINT NOT NULL REFERENCES employees(id),
    evaluation_type         VARCHAR(50) NOT NULL,
    evaluation_date         DATE NOT NULL,
    score                   NUMERIC(3,1),
    status                  VARCHAR(20) DEFAULT 'PENDIENTE',
    strengths               VARCHAR(500),
    improvements            VARCHAR(500),
    comments                VARCHAR(500),
    institution_id          BIGINT NOT NULL,
    evaluated_by_user_id    BIGINT NOT NULL,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE holidays (
    id              BIGSERIAL PRIMARY KEY,
    institution_id  BIGINT NOT NULL,
    name            VARCHAR(150) NOT NULL,
    holiday_date    DATE NOT NULL,
    category        VARCHAR(30) DEFAULT 'NACIONAL',
    description     TEXT,
    active          BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE payrolls (
    id                  BIGSERIAL PRIMARY KEY,
    institution_id      BIGINT NOT NULL,
    period              VARCHAR(30) NOT NULL,
    period_start        DATE NOT NULL,
    period_end          DATE NOT NULL,
    total_gross         NUMERIC(12,2) DEFAULT 0,
    total_deductions    NUMERIC(12,2) DEFAULT 0,
    total_net           NUMERIC(12,2) DEFAULT 0,
    status              VARCHAR(20) NOT NULL DEFAULT 'BORRADOR',
    notes               VARCHAR(100),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE payroll_entries (
    id                  BIGSERIAL PRIMARY KEY,
    payroll_id          BIGINT NOT NULL,
    employee_id         BIGINT NOT NULL,
    base_salary         NUMERIC(12,2),
    overtime_hours      NUMERIC(5,2) DEFAULT 0,
    overtime_amount     NUMERIC(12,2) DEFAULT 0,
    bonus_amount        NUMERIC(12,2) DEFAULT 0,
    gross_salary        NUMERIC(12,2),
    iess_deduction      NUMERIC(12,2) DEFAULT 0,
    loan_deduction      NUMERIC(12,2) DEFAULT 0,
    other_deductions    NUMERIC(12,2) DEFAULT 0,
    total_deductions    NUMERIC(12,2),
    net_salary          NUMERIC(12,2),
    notes               VARCHAR(100),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE staff_permissions (
    id                  BIGSERIAL PRIMARY KEY,
    employee_id         BIGINT NOT NULL,
    permission_type     VARCHAR(25) NOT NULL,
    start_date          DATE NOT NULL,
    end_date            DATE NOT NULL,
    hours_requested     NUMERIC,
    days_requested      INTEGER,
    reason              TEXT NOT NULL,
    medical_certificate BOOLEAN DEFAULT FALSE,
    status              VARCHAR(15) NOT NULL DEFAULT 'PENDIENTE',
    approved_by         VARCHAR(100),
    approval_date       DATE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE training_courses (
    id                  BIGSERIAL PRIMARY KEY,
    institution_id      BIGINT NOT NULL,
    name                VARCHAR(200) NOT NULL,
    description         TEXT,
    provider            VARCHAR(200),
    course_type         VARCHAR(20) NOT NULL DEFAULT 'INTERNO',
    hours               NUMERIC(5,2),
    start_date          DATE,
    end_date            DATE,
    max_participants    INTEGER,
    status              VARCHAR(15) NOT NULL DEFAULT 'PLANIFICADO',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE training_contents (
    id                  BIGSERIAL PRIMARY KEY,
    course_id           BIGINT NOT NULL,
    title               VARCHAR(200) NOT NULL,
    description         VARCHAR(2000),
    content_type        VARCHAR(30) DEFAULT 'LESSON',
    sort_order          INTEGER DEFAULT 0,
    content             TEXT,
    resource_url        VARCHAR(500),
    duration_minutes    INTEGER,
    institution_id      BIGINT NOT NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE training_enrollments (
    id                  BIGSERIAL PRIMARY KEY,
    course_id           BIGINT NOT NULL,
    employee_id         BIGINT NOT NULL,
    enrollment_date     DATE NOT NULL DEFAULT CURRENT_DATE,
    completion_date     DATE,
    grade               NUMERIC(5,2),
    certificate_url     VARCHAR(300),
    status              VARCHAR(15) NOT NULL DEFAULT 'INSCRITO',
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE vacancies (
    id                  BIGSERIAL PRIMARY KEY,
    title               VARCHAR(200) NOT NULL,
    description         VARCHAR(2000),
    department          VARCHAR(50) NOT NULL,
    position_type       VARCHAR(50) DEFAULT 'FULL_TIME',
    status              VARCHAR(50) DEFAULT 'OPEN',
    positions_available INTEGER DEFAULT 1,
    published_date      DATE DEFAULT CURRENT_DATE,
    closing_date        DATE,
    requirements        VARCHAR(100),
    institution_id      BIGINT NOT NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE vacation_periods (
    id              BIGSERIAL PRIMARY KEY,
    employee_id     BIGINT NOT NULL,
    year            INTEGER NOT NULL,
    total_days      INTEGER NOT NULL DEFAULT 15,
    used_days       INTEGER NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE vacation_requests (
    id                  BIGSERIAL PRIMARY KEY,
    employee_id         BIGINT NOT NULL,
    period_id           BIGINT NOT NULL,
    start_date          DATE NOT NULL,
    end_date            DATE NOT NULL,
    days_requested      INTEGER NOT NULL,
    reason              TEXT,
    status              VARCHAR(15) NOT NULL DEFAULT 'PENDIENTE',
    approved_by         VARCHAR(100),
    approval_date       DATE,
    observations        TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 13. COMUNICACION
-- ============================================================================

CREATE TABLE notifications (
    id              BIGSERIAL PRIMARY KEY,
    institution_id  BIGINT NOT NULL,
    template_id     BIGINT,
    user_id         BIGINT,
    student_id      BIGINT,
    title           VARCHAR(200) NOT NULL,
    message         TEXT NOT NULL,
    channel         VARCHAR(20) NOT NULL DEFAULT 'IN_APP',
    priority        VARCHAR(10) NOT NULL DEFAULT 'NORMAL',
    read_status     BOOLEAN DEFAULT FALSE,
    read_at         TIMESTAMPTZ,
    sent_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE communication_groups (
    id              BIGSERIAL PRIMARY KEY,
    institution_id  BIGINT NOT NULL,
    name            VARCHAR(100) NOT NULL,
    description     TEXT,
    group_type      VARCHAR(20) NOT NULL DEFAULT 'PERSONALIZADO',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE communication_group_members (
    id              BIGSERIAL PRIMARY KEY,
    group_id        BIGINT NOT NULL,
    user_id         BIGINT NOT NULL,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE internal_messages (
    id                  BIGSERIAL PRIMARY KEY,
    institution_id      BIGINT NOT NULL,
    sender_id           BIGINT NOT NULL,
    subject             VARCHAR(200) NOT NULL,
    body                TEXT NOT NULL,
    priority            VARCHAR(10) NOT NULL DEFAULT 'NORMAL',
    read_status         BOOLEAN DEFAULT FALSE,
    read_at             TIMESTAMPTZ,
    parent_message_id   BIGINT,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE message_recipients (
    id              BIGSERIAL PRIMARY KEY,
    message_id      BIGINT NOT NULL,
    user_id         BIGINT NOT NULL,
    read_status     BOOLEAN DEFAULT FALSE,
    read_at         TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE notification_templates (
    id              BIGSERIAL PRIMARY KEY,
    institution_id  BIGINT NOT NULL,
    name            VARCHAR(100) NOT NULL,
    subject         VARCHAR(200) NOT NULL,
    body_template   TEXT NOT NULL,
    channel         VARCHAR(20) NOT NULL DEFAULT 'IN_APP',
    event_type      VARCHAR(50),
    active          BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE parent_communications (
    id                  BIGSERIAL PRIMARY KEY,
    institution_id      BIGINT NOT NULL,
    student_id          BIGINT NOT NULL,
    representative_id   BIGINT,
    user_id             BIGINT,
    communication_type  VARCHAR(30) NOT NULL,
    subject             VARCHAR(200) NOT NULL,
    message             TEXT NOT NULL,
    channel             VARCHAR(20) NOT NULL DEFAULT 'IN_APP',
    status              VARCHAR(15) NOT NULL DEFAULT 'ENVIADO',
    response            TEXT,
    responded_at        TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE circulars (
    id                      BIGSERIAL PRIMARY KEY,
    title                   VARCHAR(200) NOT NULL,
    content                 VARCHAR(2000) NOT NULL,
    category                VARCHAR(50),
    publish_date            DATE NOT NULL,
    status                  VARCHAR(30) DEFAULT 'PUBLICADA',
    institution_id          BIGINT NOT NULL,
    author_user_id          BIGINT NOT NULL,
    requires_acknowledge    BOOLEAN DEFAULT FALSE,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE school_events (
    id                  BIGSERIAL PRIMARY KEY,
    title               VARCHAR(200) NOT NULL,
    description         VARCHAR(1000),
    event_date          TIMESTAMP NOT NULL,
    end_date            TIMESTAMP,
    location            VARCHAR(100),
    event_type          VARCHAR(30),
    status              VARCHAR(30) DEFAULT 'PROGRAMADO',
    institution_id      BIGINT NOT NULL,
    organizer_user_id   BIGINT NOT NULL,
    is_public           BOOLEAN DEFAULT TRUE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE announcements (
    id                  BIGSERIAL PRIMARY KEY,
    title               VARCHAR(200) NOT NULL,
    description         TEXT NOT NULL,
    announcement_type   VARCHAR(20) NOT NULL,
    priority            VARCHAR(10) NOT NULL DEFAULT 'NORMAL',
    event_date          DATE,
    event_end_date      DATE,
    course_id           BIGINT REFERENCES courses(id),
    created_by          BIGINT NOT NULL REFERENCES users(id),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE announcement_recipients (
    id              BIGSERIAL PRIMARY KEY,
    announcement_id BIGINT NOT NULL REFERENCES announcements(id),
    user_id         BIGINT NOT NULL REFERENCES users(id),
    is_read         BOOLEAN NOT NULL DEFAULT FALSE,
    read_at         TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (announcement_id, user_id)
);

CREATE TABLE announcement_schedules (
    id                  BIGSERIAL PRIMARY KEY,
    announcement_id     BIGINT NOT NULL REFERENCES announcements(id),
    schedule_date       DATE NOT NULL,
    weekday             SMALLINT NOT NULL,
    schedule_block_id   BIGINT NOT NULL REFERENCES schedule_blocks(id),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (announcement_id, schedule_date, schedule_block_id)
);

-- ============================================================================
-- 14. AUDITORIA
-- ============================================================================

CREATE TABLE audit_logs (
    id              BIGSERIAL PRIMARY KEY,
    action          VARCHAR(50) NOT NULL,
    entity_type     VARCHAR(100) NOT NULL,
    entity_id       BIGINT,
    entity_name     VARCHAR(100),
    user_id         BIGINT,
    username        VARCHAR(100),
    institution_id  BIGINT,
    details         TEXT,
    old_values      TEXT,
    new_values      TEXT,
    status          VARCHAR(50) NOT NULL DEFAULT 'EXITOSO',
    ip_address      VARCHAR(50),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE logs (
    id              BIGSERIAL PRIMARY KEY,
    username        VARCHAR(120) NOT NULL,
    action          VARCHAR(100) NOT NULL,
    module          VARCHAR(100) NOT NULL,
    details         VARCHAR(1500),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 15. BRANDING
-- ============================================================================

CREATE TABLE institution_branding (
    id                      BIGSERIAL PRIMARY KEY,
    institution_id          BIGINT NOT NULL UNIQUE REFERENCES institutions(id),
    display_name            VARCHAR(200) NOT NULL,
    login_badge_text        VARCHAR(80) NOT NULL,
    login_title             VARCHAR(200) NOT NULL,
    login_subtitle          VARCHAR(400) NOT NULL,
    login_helper_text       VARCHAR(200) NOT NULL,
    shell_title             VARCHAR(200) NOT NULL,
    shell_subtitle          VARCHAR(300) NOT NULL,
    mobile_title            VARCHAR(200) NOT NULL,
    mobile_subtitle         VARCHAR(300) NOT NULL,
    logo_url                VARCHAR(500),
    login_logo_url          VARCHAR(500),
    primary_color           VARCHAR(7) NOT NULL,
    secondary_color         VARCHAR(7) NOT NULL,
    accent_color            VARCHAR(7) NOT NULL,
    background_color        VARCHAR(7) NOT NULL,
    surface_color           VARCHAR(7) NOT NULL,
    text_color              VARCHAR(7) NOT NULL,
    contrast_text_color     VARCHAR(7) NOT NULL,
    muted_text_color        VARCHAR(7) NOT NULL,
    heading_large_color     VARCHAR(7) NOT NULL,
    heading_medium_color    VARCHAR(7) NOT NULL,
    body_text_color         VARCHAR(7) NOT NULL,
    button_color            VARCHAR(7) NOT NULL,
    button_text_color       VARCHAR(7) NOT NULL,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE institution_carousel_slides (
    id              BIGSERIAL PRIMARY KEY,
    institution_id  BIGINT NOT NULL REFERENCES institutions(id),
    badge           VARCHAR(80) NOT NULL,
    title           VARCHAR(200) NOT NULL,
    description     VARCHAR(400) NOT NULL,
    image_url       VARCHAR(500) NOT NULL,
    slide_order     INTEGER NOT NULL,
    active          BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 16. CERTIFICADOS
-- ============================================================================

CREATE TABLE certificate_templates (
    id                  BIGSERIAL PRIMARY KEY,
    institution_id      BIGINT NOT NULL REFERENCES institutions(id),
    name                VARCHAR(150) NOT NULL,
    template_type       VARCHAR(30) NOT NULL,
    description         VARCHAR(500),
    header_text         TEXT,
    footer_text         TEXT,
    requires_grades     BOOLEAN NOT NULL DEFAULT FALSE,
    requires_conduct    BOOLEAN NOT NULL DEFAULT FALSE,
    active              BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (institution_id, name)
);

CREATE TABLE certificates (
    id                  BIGSERIAL PRIMARY KEY,
    institution_id      BIGINT NOT NULL REFERENCES institutions(id),
    template_id         BIGINT NOT NULL REFERENCES certificate_templates(id),
    student_id          BIGINT NOT NULL REFERENCES students(id),
    course_id           BIGINT REFERENCES courses(id),
    academic_period_id  BIGINT REFERENCES academic_periods(id),
    certificate_number  VARCHAR(50) NOT NULL UNIQUE,
    status              VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    issued_at           TIMESTAMPTZ,
    issued_by           VARCHAR(100),
    valid_until         DATE,
    observations        TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE certificate_details (
    id              BIGSERIAL PRIMARY KEY,
    certificate_id  BIGINT NOT NULL REFERENCES certificates(id),
    subject_name    VARCHAR(150),
    score           NUMERIC(5,2),
    status          VARCHAR(20),
    observation     VARCHAR(300),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 17. NEE / ADAPTACIONES / DECE
-- ============================================================================

CREATE TABLE special_needs (
    id                      BIGSERIAL PRIMARY KEY,
    student_id              BIGINT NOT NULL,
    diagnosis               VARCHAR(300) NOT NULL,
    diagnosis_date          DATE,
    need_type               VARCHAR(30) NOT NULL,
    severity                VARCHAR(15) NOT NULL DEFAULT 'MODERADA',
    description             TEXT,
    professional            VARCHAR(200),
    professional_contact    VARCHAR(150),
    iep_summary             TEXT,
    status                  VARCHAR(15) NOT NULL DEFAULT 'ACTIVA',
    created_by              VARCHAR(100),
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE curricular_adaptations (
    id                      BIGSERIAL PRIMARY KEY,
    special_needs_id        BIGINT NOT NULL,
    student_id              BIGINT NOT NULL,
    subject_id              BIGINT,
    adaptation_type         VARCHAR(25) NOT NULL,
    area                    VARCHAR(100),
    description             TEXT NOT NULL,
    goals                   TEXT,
    strategies              TEXT,
    evaluation_adjustments  TEXT,
    period_id               BIGINT,
    status                  VARCHAR(15) NOT NULL DEFAULT 'ACTIVE',
    created_by              VARCHAR(100),
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE dece_cases (
    id                  BIGSERIAL PRIMARY KEY,
    student_id          BIGINT NOT NULL,
    case_type           VARCHAR(30) NOT NULL,
    priority            VARCHAR(10) NOT NULL DEFAULT 'NORMAL',
    description         TEXT NOT NULL,
    counselor_name      VARCHAR(200),
    interventions       TEXT,
    follow_up_notes     TEXT,
    status              VARCHAR(20) NOT NULL DEFAULT 'ABIERTO',
    open_date           DATE NOT NULL DEFAULT CURRENT_DATE,
    close_date          DATE,
    result              TEXT,
    created_by          VARCHAR(100),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE dece_follow_ups (
    id              BIGSERIAL PRIMARY KEY,
    case_id         BIGINT NOT NULL,
    date            DATE NOT NULL DEFAULT CURRENT_DATE,
    notes           TEXT NOT NULL,
    actions_taken   TEXT,
    next_steps      TEXT,
    created_by      VARCHAR(100),
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 18. GESTION ESTUDIANTIL
-- ============================================================================

CREATE TABLE clubs (
    id              BIGSERIAL PRIMARY KEY,
    institution_id  BIGINT NOT NULL,
    name            VARCHAR(150) NOT NULL,
    description     TEXT,
    club_type       VARCHAR(20) NOT NULL DEFAULT 'DEPORTIVO',
    coordinator     VARCHAR(200),
    schedule_info   TEXT,
    max_members     INTEGER,
    active          BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE club_memberships (
    id                  BIGSERIAL PRIMARY KEY,
    club_id             BIGINT NOT NULL,
    student_id          BIGINT NOT NULL,
    enrollment_date     DATE NOT NULL DEFAULT CURRENT_DATE,
    role                VARCHAR(20) NOT NULL DEFAULT 'MIEMBRO',
    status              VARCHAR(15) NOT NULL DEFAULT 'ACTIVO',
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE scholarship_types (
    id                  BIGSERIAL PRIMARY KEY,
    institution_id      BIGINT NOT NULL,
    name                VARCHAR(150) NOT NULL,
    description         TEXT,
    coverage_percent    NUMERIC(5,2),
    coverage_amount     NUMERIC(10,2),
    criteria            TEXT,
    active              BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE scholarship_applications (
    id                  BIGSERIAL PRIMARY KEY,
    student_id          BIGINT NOT NULL,
    type_id             BIGINT NOT NULL,
    academic_year_id    BIGINT,
    application_date    DATE NOT NULL DEFAULT CURRENT_DATE,
    justification       TEXT,
    family_income       NUMERIC(10,2),
    siblings_in_school  INTEGER DEFAULT 0,
    gpa                 NUMERIC(4,2),
    documents_url       TEXT,
    status              VARCHAR(15) NOT NULL DEFAULT 'PENDIENTE',
    reviewed_by         VARCHAR(100),
    review_date         DATE,
    award_amount        NUMERIC(10,2),
    observations        TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE transport_routes (
    id                  BIGSERIAL PRIMARY KEY,
    institution_id      BIGINT NOT NULL,
    route_name          VARCHAR(150) NOT NULL,
    route_code          VARCHAR(10),
    description         TEXT,
    origin              VARCHAR(200),
    destination         VARCHAR(200),
    stops               TEXT,
    morning_departure   TIME,
    morning_arrival     TIME,
    afternoon_departure TIME,
    afternoon_arrival   TIME,
    capacity            INTEGER NOT NULL DEFAULT 0,
    vehicle_plate       VARCHAR(20),
    driver_name         VARCHAR(200),
    driver_phone        VARCHAR(20),
    monthly_fee         NUMERIC(8,2),
    status              VARCHAR(15) NOT NULL DEFAULT 'ACTIVA',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE transport_assignments (
    id                  BIGSERIAL PRIMARY KEY,
    route_id            BIGINT NOT NULL,
    student_id          BIGINT NOT NULL,
    academic_year_id    BIGINT,
    assignment_date     DATE NOT NULL DEFAULT CURRENT_DATE,
    pickup_point        VARCHAR(200),
    dropoff_point       VARCHAR(200),
    shift               VARCHAR(10) NOT NULL DEFAULT 'MATUTINO',
    monthly_fee         NUMERIC(8,2),
    status              VARCHAR(15) NOT NULL DEFAULT 'ACTIVO',
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE psychological_evaluations (
    id                  BIGSERIAL PRIMARY KEY,
    student_id          BIGINT NOT NULL,
    evaluation_date     DATE NOT NULL DEFAULT CURRENT_DATE,
    evaluator_name      VARCHAR(200),
    evaluation_type     VARCHAR(30) NOT NULL,
    area                VARCHAR(100),
    findings            TEXT NOT NULL,
    recommendations     TEXT,
    risk_level          VARCHAR(10) DEFAULT 'BAJO',
    follow_up_needed    BOOLEAN DEFAULT FALSE,
    follow_up_date      DATE,
    status              VARCHAR(15) NOT NULL DEFAULT 'COMPLETADA',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE student_insurance (
    id                  BIGSERIAL PRIMARY KEY,
    student_id          BIGINT NOT NULL,
    provider            VARCHAR(200) NOT NULL,
    policy_number       VARCHAR(50) NOT NULL,
    insurance_type      VARCHAR(20) NOT NULL DEFAULT 'BASICO',
    start_date          DATE NOT NULL,
    end_date            DATE NOT NULL,
    coverage_details    TEXT,
    monthly_premium     NUMERIC(8,2),
    status              VARCHAR(15) NOT NULL DEFAULT 'ACTIVO',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE student_health_records (
    id                  BIGSERIAL PRIMARY KEY,
    student_id          BIGINT NOT NULL UNIQUE,
    blood_type          VARCHAR(5),
    weight_kg           NUMERIC(5,2),
    height_cm           NUMERIC(5,2),
    allergies           TEXT,
    chronic_conditions  TEXT,
    medications         TEXT,
    dietary_restrictions TEXT,
    insurance_provider  VARCHAR(200),
    insurance_number    VARCHAR(50),
    insurance_expiry    DATE,
    emergency_contact   VARCHAR(200),
    emergency_phone     VARCHAR(20),
    doctor_name         VARCHAR(200),
    doctor_phone        VARCHAR(20),
    notes               TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE student_vaccinations (
    id                  BIGSERIAL PRIMARY KEY,
    student_id          BIGINT NOT NULL,
    vaccine_name        VARCHAR(150) NOT NULL,
    dose_number         INTEGER,
    dose_date           DATE NOT NULL,
    next_dose_date      DATE,
    lot_number          VARCHAR(50),
    administered_by     VARCHAR(200),
    institution         VARCHAR(200),
    status              VARCHAR(15) NOT NULL DEFAULT 'COMPLETADA',
    notes               TEXT,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 19. TUTORIA
-- ============================================================================

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
    session_type        VARCHAR(30) NOT NULL DEFAULT 'ACADEMICA',
    status              VARCHAR(20) NOT NULL DEFAULT 'PROGRAMADA',
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

CREATE TABLE tutoring_follow_ups (
    id              BIGSERIAL PRIMARY KEY,
    session_id      BIGINT NOT NULL REFERENCES tutoring_sessions(id),
    follow_up_date  DATE NOT NULL,
    notes           TEXT NOT NULL,
    status          VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE',
    completed_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 20. IA
-- ============================================================================

CREATE TABLE ai_models (
    id              BIGSERIAL PRIMARY KEY,
    institution_id  BIGINT NOT NULL,
    name            VARCHAR(100) NOT NULL,
    model_type      VARCHAR(30) NOT NULL,
    description     TEXT,
    version         VARCHAR(20) NOT NULL DEFAULT '1.0',
    config          JSONB,
    status          VARCHAR(15) NOT NULL DEFAULT 'ACTIVO',
    last_trained_at TIMESTAMPTZ,
    accuracy        NUMERIC(5,4),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE ai_predictions (
    id                  BIGSERIAL PRIMARY KEY,
    model_id            BIGINT NOT NULL,
    student_id          BIGINT NOT NULL,
    period_id           BIGINT,
    prediction_type     VARCHAR(30) NOT NULL,
    predicted_value     VARCHAR(100) NOT NULL,
    confidence          NUMERIC(5,4) NOT NULL,
    input_data          JSONB,
    explanation         TEXT,
    status              VARCHAR(15) NOT NULL DEFAULT 'VIGENTE',
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE ai_anomalies (
    id              BIGSERIAL PRIMARY KEY,
    model_id        BIGINT,
    institution_id  BIGINT NOT NULL,
    anomaly_type    VARCHAR(30) NOT NULL,
    entity_type     VARCHAR(20) NOT NULL,
    entity_id       BIGINT NOT NULL,
    description     TEXT NOT NULL,
    severity        VARCHAR(10) NOT NULL DEFAULT 'MEDIA',
    detected_value  VARCHAR(200),
    expected_range  VARCHAR(200),
    status          VARCHAR(15) NOT NULL DEFAULT 'DETECTADA',
    resolved_at     TIMESTAMPTZ,
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE ai_recommendations (
    id              BIGSERIAL PRIMARY KEY,
    model_id        BIGINT,
    institution_id  BIGINT NOT NULL,
    target_type     VARCHAR(20) NOT NULL,
    target_id       BIGINT,
    category        VARCHAR(30) NOT NULL,
    title           VARCHAR(200) NOT NULL,
    description     TEXT NOT NULL,
    priority        VARCHAR(10) NOT NULL DEFAULT 'NORMAL',
    status          VARCHAR(15) NOT NULL DEFAULT 'PENDIENTE',
    applied_at      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE ai_student_profiles (
    id                  BIGSERIAL PRIMARY KEY,
    student_id          BIGINT NOT NULL,
    institution_id      BIGINT NOT NULL,
    academic_risk       NUMERIC(5,4) DEFAULT 0,
    attendance_risk     NUMERIC(5,4) DEFAULT 0,
    behavior_score      NUMERIC(5,4) DEFAULT 0,
    engagement_score    NUMERIC(5,4) DEFAULT 0,
    learning_style      VARCHAR(30),
    strengths           TEXT,
    weaknesses          TEXT,
    recommendations     TEXT,
    last_analyzed       TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE ai_learning_styles (
    id                  BIGSERIAL PRIMARY KEY,
    student_id          BIGINT NOT NULL,
    institution_id      BIGINT NOT NULL,
    dominant_style      VARCHAR(50) DEFAULT 'VISUAL',
    visual_score        DOUBLE PRECISION DEFAULT 0.0,
    auditory_score      DOUBLE PRECISION DEFAULT 0.0,
    kinesthetic_score   DOUBLE PRECISION DEFAULT 0.0,
    reading_score       DOUBLE PRECISION DEFAULT 0.0,
    assessment_count    INTEGER DEFAULT 0,
    observations        TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE ai_study_plans (
    id                  BIGSERIAL PRIMARY KEY,
    student_id          BIGINT NOT NULL,
    institution_id      BIGINT NOT NULL,
    title               VARCHAR(200),
    description         TEXT,
    objectives          TEXT,
    activities          TEXT,
    resources           TEXT,
    status              VARCHAR(30) DEFAULT 'DRAFT',
    start_date          DATE,
    end_date            DATE,
    progress_percent    DOUBLE PRECISION DEFAULT 0.0,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 21. BANCO DE PREGUNTAS
-- ============================================================================

CREATE TABLE question_categories (
    id              BIGSERIAL PRIMARY KEY,
    institution_id  BIGINT NOT NULL REFERENCES institutions(id),
    name            VARCHAR(150) NOT NULL,
    description     VARCHAR(300),
    active          BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (institution_id, name)
);

CREATE TABLE questions (
    id              BIGSERIAL PRIMARY KEY,
    institution_id  BIGINT NOT NULL REFERENCES institutions(id),
    subject_id      BIGINT NOT NULL REFERENCES subjects(id),
    category_id     BIGINT REFERENCES question_categories(id),
    question_type   VARCHAR(20) NOT NULL DEFAULT 'OPEN',
    difficulty      VARCHAR(15) NOT NULL DEFAULT 'MEDIUM',
    question_text   TEXT NOT NULL,
    correct_answer  TEXT,
    option_a        VARCHAR(500),
    option_b        VARCHAR(500),
    option_c        VARCHAR(500),
    option_d        VARCHAR(500),
    explanation     TEXT,
    points          NUMERIC(5,2) DEFAULT 1,
    tags            VARCHAR(300),
    created_by      VARCHAR(100),
    active          BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 22. SEGUIMIENTO EN LINEA (daily log related - FK already created above)
-- ============================================================================

-- ============================================================================
-- 23. SEGURO ESTUDIANTIL (ya creado arriba)
-- ============================================================================

-- ============================================================================
-- 24. NOTA: tablas que referencian demerits en daily_log_student_incidents
-- ============================================================================

ALTER TABLE daily_log_student_incidents
    ADD CONSTRAINT fk_dlsi_demerit FOREIGN KEY (demerit_id) REFERENCES demerits(id);

-- ============================================================================
-- 25. INDICES
-- ============================================================================

CREATE INDEX idx_users_institution ON users(institution_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_students_course ON students(course_id);
CREATE INDEX idx_teachers_user ON teachers(user_id);
CREATE INDEX idx_courses_academic_year ON courses(academic_year_id);
CREATE INDEX idx_courses_school_day ON courses(school_day_id);
CREATE INDEX idx_courses_school_modality ON courses(school_modality_id);
CREATE INDEX idx_classrooms_institution ON classrooms(institution_id);
CREATE INDEX idx_classrooms_campus ON classrooms(campus_id);
CREATE INDEX idx_campus_institution ON campus(institution_id);
CREATE INDEX idx_shifts_institution ON shifts(institution_id);
CREATE INDEX idx_academic_periods_institution ON academic_periods(institution_id);
CREATE INDEX idx_institution_settings_institution ON institution_settings(institution_id);
CREATE INDEX idx_school_calendar_events_institution ON school_calendar_events(institution_id);
CREATE INDEX idx_lesson_plans_teacher ON lesson_plans(teacher_id);
CREATE INDEX idx_lesson_plans_subject ON lesson_plans(subject_id);
CREATE INDEX idx_lesson_plans_course ON lesson_plans(course_id);
CREATE INDEX idx_lesson_plans_period ON lesson_plans(period_id);
CREATE INDEX idx_evaluations_lesson_plan ON evaluations(lesson_plan_id);
CREATE INDEX idx_evaluations_student ON evaluations(student_id);
CREATE INDEX idx_grades_evaluation ON grades(evaluation_id);
CREATE INDEX idx_grades_student ON grades(student_id);
CREATE INDEX idx_period_grades_student ON period_grades(student_id);
CREATE INDEX idx_period_grades_course ON period_grades(course_id);
CREATE INDEX idx_report_cards_student ON report_cards(student_id);
CREATE INDEX idx_report_cards_course ON report_cards(course_id);
CREATE INDEX idx_report_cards_period ON report_cards(academic_period_id);
CREATE INDEX idx_course_schedules_course ON course_schedules(course_id);
CREATE INDEX idx_course_schedules_period ON course_schedules(period_id);
CREATE INDEX idx_course_schedules_teacher ON course_schedules(teacher_id);
CREATE INDEX idx_enrollments_student ON enrollments(student_id);
CREATE INDEX idx_enrollments_period ON enrollments(period_id);
CREATE INDEX idx_daily_logs_institution ON daily_logs(institution_id);
CREATE INDEX idx_daily_logs_course ON daily_logs(course_id);
CREATE INDEX idx_daily_logs_period ON daily_logs(period_id);
CREATE INDEX idx_daily_log_entries_daily_log ON daily_log_entries(daily_log_id);
CREATE INDEX idx_student_demers_student ON student_demers(student_id);
CREATE INDEX idx_student_demers_period ON student_demers(period_id);
CREATE INDEX idx_merit_categories_institution ON merit_categories(institution_id);
CREATE INDEX idx_student_merits_student ON student_merits(student_id);
CREATE INDEX idx_student_merits_institution ON student_merits(institution_id);
CREATE INDEX idx_cash_registers_institution ON cash_registers(institution_id);
CREATE INDEX idx_invoices_institution ON invoices(institution_id);
CREATE INDEX idx_invoices_student ON invoices(student_id);
CREATE INDEX idx_credit_notes_institution ON credit_notes(institution_id);
CREATE INDEX idx_accounts_receivable_institution ON accounts_receivable(institution_id);
CREATE INDEX idx_accounts_receivable_student ON accounts_receivable(student_id);
CREATE INDEX idx_assets_institution ON assets(institution_id);
CREATE INDEX idx_assets_category ON assets(category_id);
CREATE INDEX idx_asset_categories_institution ON asset_categories(institution_id);
CREATE INDEX idx_asset_maintenances_asset ON asset_maintenances(asset_id);
CREATE INDEX idx_asset_warranties_asset ON asset_warranties(asset_id);
CREATE INDEX idx_employees_institution ON employees(institution_id);
CREATE INDEX idx_employee_attendances_employee ON employee_attendances(employee_id);
CREATE INDEX idx_employee_actions_employee ON employee_actions(employee_id);
CREATE INDEX idx_employee_evaluations_employee ON employee_evaluations(employee_id);
CREATE INDEX idx_employment_contracts_employee ON employment_contracts(employee_id);
CREATE INDEX idx_payrolls_institution ON payrolls(institution_id);
CREATE INDEX idx_payroll_entries_payroll ON payroll_entries(payroll_id);
CREATE INDEX idx_payroll_entries_employee ON payroll_entries(employee_id);
CREATE INDEX idx_staff_permissions_employee ON staff_permissions(employee_id);
CREATE INDEX idx_training_courses_institution ON training_courses(institution_id);
CREATE INDEX idx_training_contents_course ON training_contents(course_id);
CREATE INDEX idx_vacation_periods_employee ON vacation_periods(employee_id);
CREATE INDEX idx_vacation_requests_employee ON vacation_requests(employee_id);
CREATE INDEX idx_notifications_institution ON notifications(institution_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_communication_groups_institution ON communication_groups(institution_id);
CREATE INDEX idx_internal_messages_institution ON internal_messages(institution_id);
CREATE INDEX idx_internal_messages_sender ON internal_messages(sender_id);
CREATE INDEX idx_message_recipients_message ON message_recipients(message_id);
CREATE INDEX idx_message_recipients_user ON message_recipients(user_id);
CREATE INDEX idx_parent_communications_institution ON parent_communications(institution_id);
CREATE INDEX idx_parent_communications_student ON parent_communications(student_id);
CREATE INDEX idx_circulars_institution ON circulars(institution_id);
CREATE INDEX idx_school_events_institution ON school_events(institution_id);
CREATE INDEX idx_announcements_course ON announcements(course_id);
CREATE INDEX idx_announcements_created_by ON announcements(created_by);
CREATE INDEX idx_audit_logs_institution ON audit_logs(institution_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_logs_username ON logs(username);
CREATE INDEX idx_clubs_institution ON clubs(institution_id);
CREATE INDEX idx_club_memberships_club ON club_memberships(club_id);
CREATE INDEX idx_club_memberships_student ON club_memberships(student_id);
CREATE INDEX idx_scholarship_types_institution ON scholarship_types(institution_id);
CREATE INDEX idx_scholarship_applications_student ON scholarship_applications(student_id);
CREATE INDEX idx_transport_routes_institution ON transport_routes(institution_id);
CREATE INDEX idx_transport_assignments_route ON transport_assignments(route_id);
CREATE INDEX idx_transport_assignments_student ON transport_assignments(student_id);
CREATE INDEX idx_psychological_evaluations_student ON psychological_evaluations(student_id);
CREATE INDEX idx_student_insurance_student ON student_insurance(student_id);
CREATE INDEX idx_student_health_records_student ON student_health_records(student_id);
CREATE INDEX idx_student_vaccinations_student ON student_vaccinations(student_id);
CREATE INDEX idx_tutoring_sessions_teacher ON tutoring_sessions(teacher_id);
CREATE INDEX idx_tutoring_sessions_student ON tutoring_sessions(student_id);
CREATE INDEX idx_tutoring_sessions_course ON tutoring_sessions(course_id);
CREATE INDEX idx_tutoring_follow_ups_session ON tutoring_follow_ups(session_id);
CREATE INDEX idx_ai_models_institution ON ai_models(institution_id);
CREATE INDEX idx_ai_predictions_model ON ai_predictions(model_id);
CREATE INDEX idx_ai_predictions_student ON ai_predictions(student_id);
CREATE INDEX idx_ai_anomalies_institution ON ai_anomalies(institution_id);
CREATE INDEX idx_ai_recommendations_institution ON ai_recommendations(institution_id);
CREATE INDEX idx_ai_student_profiles_student ON ai_student_profiles(student_id);
CREATE INDEX idx_ai_student_profiles_institution ON ai_student_profiles(institution_id);
CREATE INDEX idx_ai_learning_styles_student ON ai_learning_styles(student_id);
CREATE INDEX idx_ai_learning_styles_institution ON ai_learning_styles(institution_id);
CREATE INDEX idx_ai_study_plans_student ON ai_study_plans(student_id);
CREATE INDEX idx_ai_study_plans_institution ON ai_study_plans(institution_id);
CREATE INDEX idx_questions_institution ON questions(institution_id);
CREATE INDEX idx_questions_subject ON questions(subject_id);
CREATE INDEX idx_questions_category ON questions(category_id);
CREATE INDEX idx_question_categories_institution ON question_categories(institution_id);

-- ============================================================================
-- 26. SEED DATA - ROLES Y PERMISOS
-- ============================================================================

INSERT INTO roles (name, description, created_at, updated_at) VALUES
('ROLE_ADMINISTRADOR', 'Administrador del sistema con acceso total', NOW(), NOW()),
('ROLE_DOCENTE', 'Docente con acceso academico', NOW(), NOW()),
('ROLE_ADMINISTRATIVO', 'Personal administrativo', NOW(), NOW()),
('ROLE_ESTUDIANTE', 'Estudiante del plantel', NOW(), NOW());

-- ============================================================================
-- FIN DEL SCHEMA
-- ============================================================================
