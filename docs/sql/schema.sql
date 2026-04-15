CREATE TABLE roles (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(120) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE role_permissions (
    role_id BIGINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_code VARCHAR(80) NOT NULL,
    PRIMARY KEY (role_id, permission_code)
);

CREATE TABLE institutions (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    code VARCHAR(13) NOT NULL UNIQUE,
    district VARCHAR(120) NOT NULL,
    circuit VARCHAR(120) NOT NULL,
    address VARCHAR(200) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE institution_branding (
    id BIGSERIAL PRIMARY KEY,
    institution_id BIGINT NOT NULL UNIQUE REFERENCES institutions(id),
    display_name VARCHAR(200) NOT NULL,
    login_badge_text VARCHAR(80) NOT NULL,
    login_title VARCHAR(200) NOT NULL,
    login_subtitle VARCHAR(400) NOT NULL,
    login_helper_text VARCHAR(200) NOT NULL,
    shell_title VARCHAR(200) NOT NULL,
    shell_subtitle VARCHAR(300) NOT NULL,
    mobile_title VARCHAR(200) NOT NULL,
    mobile_subtitle VARCHAR(300) NOT NULL,
    logo_url VARCHAR(500),
    login_logo_url VARCHAR(500),
    primary_color VARCHAR(7) NOT NULL,
    secondary_color VARCHAR(7) NOT NULL,
    accent_color VARCHAR(7) NOT NULL,
    background_color VARCHAR(7) NOT NULL,
    surface_color VARCHAR(7) NOT NULL,
    text_color VARCHAR(7) NOT NULL,
    contrast_text_color VARCHAR(7) NOT NULL,
    muted_text_color VARCHAR(7) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE institution_carousel_slides (
    id BIGSERIAL PRIMARY KEY,
    institution_id BIGINT NOT NULL REFERENCES institutions(id),
    badge VARCHAR(80) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description VARCHAR(400) NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    slide_order INTEGER NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(20) NOT NULL UNIQUE,
    email VARCHAR(120) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    identification VARCHAR(20) NOT NULL,
    first_name VARCHAR(150) NOT NULL,
    last_name VARCHAR(150) NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    institution_id BIGINT NOT NULL REFERENCES institutions(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE user_roles (
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id BIGINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

CREATE TABLE academic_periods (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE courses (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    parallel VARCHAR(5) NOT NULL,
    level VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE subjects (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    code VARCHAR(30) NOT NULL UNIQUE,
    curriculum_area VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE teachers (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE REFERENCES users(id),
    specialization VARCHAR(120) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE students (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE REFERENCES users(id),
    course_id BIGINT NOT NULL REFERENCES courses(id),
    enrollment_number VARCHAR(30) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE courses ADD COLUMN week_student_id BIGINT REFERENCES students(id);

CREATE TABLE schedule_blocks (
    id BIGSERIAL PRIMARY KEY,
    label VARCHAR(80) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    block_order INTEGER NOT NULL,
    block_type VARCHAR(20) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_schedule_blocks_type CHECK (block_type IN ('CLASS', 'RECESS'))
);

CREATE TABLE course_schedules (
    id BIGSERIAL PRIMARY KEY,
    course_id BIGINT NOT NULL REFERENCES courses(id),
    period_id BIGINT NOT NULL REFERENCES academic_periods(id),
    schedule_block_id BIGINT NOT NULL REFERENCES schedule_blocks(id),
    subject_id BIGINT NOT NULL REFERENCES subjects(id),
    teacher_id BIGINT NOT NULL REFERENCES teachers(id),
    weekday SMALLINT NOT NULL,
    classroom VARCHAR(80),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_course_schedules_weekday CHECK (weekday BETWEEN 1 AND 7)
);

CREATE TABLE lesson_plans (
    id BIGSERIAL PRIMARY KEY,
    lesson_date DATE NOT NULL,
    teacher_id BIGINT NOT NULL REFERENCES teachers(id),
    subject_id BIGINT NOT NULL REFERENCES subjects(id),
    course_id BIGINT NOT NULL REFERENCES courses(id),
    period_id BIGINT NOT NULL REFERENCES academic_periods(id),
    topic VARCHAR(250) NOT NULL,
    objective VARCHAR(500) NOT NULL,
    activities TEXT NOT NULL,
    resources TEXT NOT NULL,
    observations VARCHAR(1000),
    curricular_skill VARCHAR(250) NOT NULL,
    curriculum_completed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE daily_logs (
    id BIGSERIAL PRIMARY KEY,
    institution_id BIGINT NOT NULL REFERENCES institutions(id),
    course_id BIGINT NOT NULL REFERENCES courses(id),
    period_id BIGINT NOT NULL REFERENCES academic_periods(id),
    work_day_number INTEGER,
    log_date DATE NOT NULL,
    city VARCHAR(120),
    general_notes TEXT,
    close_token VARCHAR(80) NOT NULL UNIQUE,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    closed_at TIMESTAMPTZ,
    created_by BIGINT NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_daily_logs_status CHECK (status IN ('DRAFT', 'CLOSED', 'SIGNED'))
);

CREATE TABLE daily_log_entries (
    id BIGSERIAL PRIMARY KEY,
    daily_log_id BIGINT NOT NULL REFERENCES daily_logs(id) ON DELETE CASCADE,
    schedule_block_id BIGINT NOT NULL REFERENCES schedule_blocks(id),
    teacher_id BIGINT REFERENCES teachers(id),
    subject_id BIGINT REFERENCES subjects(id),
    didactic_unit VARCHAR(250),
    curricular_skill VARCHAR(300),
    topic VARCHAR(300),
    close_token VARCHAR(80) NOT NULL UNIQUE,
    teacher_signature_status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    teacher_closed_at TIMESTAMPTZ,
    specific_notes TEXT,
    general_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_daily_log_entries UNIQUE (daily_log_id, schedule_block_id),
    CONSTRAINT chk_daily_log_teacher_signature CHECK (teacher_signature_status IN ('PENDING', 'SIGNED'))
);

CREATE TABLE daily_log_student_absences (
    id BIGSERIAL PRIMARY KEY,
    daily_log_entry_id BIGINT NOT NULL REFERENCES daily_log_entries(id) ON DELETE CASCADE,
    student_id BIGINT NOT NULL REFERENCES students(id),
    absence_type VARCHAR(20) NOT NULL DEFAULT 'ABSENT',
    notes VARCHAR(300),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_daily_log_absence UNIQUE (daily_log_entry_id, student_id),
    CONSTRAINT chk_daily_log_absence_type CHECK (absence_type IN ('ABSENT', 'LATE', 'JUSTIFIED'))
);

CREATE TABLE daily_log_student_incidents (
    id BIGSERIAL PRIMARY KEY,
    daily_log_entry_id BIGINT NOT NULL REFERENCES daily_log_entries(id) ON DELETE CASCADE,
    student_id BIGINT NOT NULL REFERENCES students(id),
    category VARCHAR(80) NOT NULL,
    notes VARCHAR(400) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_daily_log_incident UNIQUE (daily_log_entry_id, student_id)
);

CREATE TABLE daily_log_signatures (
    id BIGSERIAL PRIMARY KEY,
    daily_log_id BIGINT NOT NULL REFERENCES daily_logs(id) ON DELETE CASCADE,
    signer_user_id BIGINT NOT NULL REFERENCES users(id),
    signer_role VARCHAR(40) NOT NULL,
    signature_type VARCHAR(30) NOT NULL,
    signed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    notes VARCHAR(300),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_daily_log_signature_type CHECK (signature_type IN ('TEACHER_TUTOR', 'WEEK_STUDENT', 'GENERAL_INSPECTOR'))
);

CREATE TABLE behavior_categories (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(10) NOT NULL UNIQUE,
    name VARCHAR(250) NOT NULL,
    description VARCHAR(500),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE behavior_offenses (
    id BIGSERIAL PRIMARY KEY,
    category_id BIGINT NOT NULL REFERENCES behavior_categories(id),
    literal VARCHAR(10) NOT NULL,
    description VARCHAR(600) NOT NULL,
    demerit_points INTEGER NOT NULL,
    severity_level VARCHAR(20),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_behavior_offense UNIQUE (category_id, literal)
);

CREATE TABLE student_demerits (
    id BIGSERIAL PRIMARY KEY,
    student_id BIGINT NOT NULL REFERENCES students(id),
    course_id BIGINT NOT NULL REFERENCES courses(id),
    period_id BIGINT NOT NULL REFERENCES academic_periods(id),
    offense_id BIGINT NOT NULL REFERENCES behavior_offenses(id),
    recorded_by BIGINT NOT NULL REFERENCES users(id),
    demerit_date DATE NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    notes VARCHAR(500),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_student_demerits_status CHECK (status IN ('ACTIVE', 'ANNULLED'))
);

CREATE TABLE evaluations (
    id BIGSERIAL PRIMARY KEY,
    lesson_plan_id BIGINT NOT NULL REFERENCES lesson_plans(id),
    student_id BIGINT NOT NULL REFERENCES students(id),
    evaluation_type VARCHAR(120) NOT NULL,
    score NUMERIC(5,2) NOT NULL,
    feedback VARCHAR(500),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE logs (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(120) NOT NULL,
    action VARCHAR(100) NOT NULL,
    module VARCHAR(100) NOT NULL,
    details VARCHAR(1500),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_institution ON users(institution_id);
CREATE INDEX idx_branding_slides_institution_order ON institution_carousel_slides(institution_id, slide_order);
CREATE INDEX idx_students_course ON students(course_id);
CREATE INDEX idx_course_schedules_course_weekday ON course_schedules(course_id, weekday);
CREATE INDEX idx_daily_logs_course_date ON daily_logs(course_id, log_date);
CREATE INDEX idx_daily_log_entries_log_block ON daily_log_entries(daily_log_id, schedule_block_id);
CREATE INDEX idx_daily_log_absences_student ON daily_log_student_absences(student_id);
CREATE INDEX idx_daily_log_incidents_student ON daily_log_student_incidents(student_id);
CREATE INDEX idx_behavior_offenses_category ON behavior_offenses(category_id);
CREATE INDEX idx_student_demerits_student_date ON student_demerits(student_id, demerit_date);
CREATE INDEX idx_lesson_plans_teacher_date ON lesson_plans(teacher_id, lesson_date);
CREATE INDEX idx_lesson_plans_course_date ON lesson_plans(course_id, lesson_date);
CREATE INDEX idx_evaluations_student ON evaluations(student_id);
CREATE INDEX idx_logs_module_created_at ON logs(module, created_at);
