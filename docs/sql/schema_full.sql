-- ============================================================================
-- LECCIONARIO - Schema completo consolidado (V1 → V14)
-- PostgreSQL 15+
-- Generado: 2026-07-06
-- Incluye: schema base + migraciones V8-V14 + campos JPA entity
-- ============================================================================

-- ============================================================================
-- 1. ROLES Y PERMISOS
-- ============================================================================

CREATE TABLE roles (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(120) NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE role_permissions (
    role_id         BIGINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_code VARCHAR(80) NOT NULL,
    PRIMARY KEY (role_id, permission_code)
);

-- ============================================================================
-- 2. INSTITUCIONES Y BRANDING
-- ============================================================================

CREATE TABLE institutions (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(200) NOT NULL,
    code        VARCHAR(13) NOT NULL UNIQUE,
    district    VARCHAR(120) NOT NULL,
    circuit     VARCHAR(120) NOT NULL,
    address     VARCHAR(200) NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE institution_branding (
    id                    BIGSERIAL PRIMARY KEY,
    institution_id        BIGINT NOT NULL UNIQUE REFERENCES institutions(id),
    display_name          VARCHAR(200) NOT NULL,
    login_badge_text      VARCHAR(80) NOT NULL,
    login_title           VARCHAR(200) NOT NULL,
    login_subtitle        VARCHAR(400) NOT NULL,
    login_helper_text     VARCHAR(200) NOT NULL,
    shell_title           VARCHAR(200) NOT NULL,
    shell_subtitle        VARCHAR(300) NOT NULL,
    mobile_title          VARCHAR(200) NOT NULL,
    mobile_subtitle       VARCHAR(300) NOT NULL,
    logo_url              VARCHAR(500),
    login_logo_url        VARCHAR(500),
    primary_color         VARCHAR(7) NOT NULL,
    secondary_color       VARCHAR(7) NOT NULL,
    accent_color          VARCHAR(7) NOT NULL,
    background_color      VARCHAR(7) NOT NULL,
    surface_color         VARCHAR(7) NOT NULL,
    text_color            VARCHAR(7) NOT NULL,
    contrast_text_color   VARCHAR(7) NOT NULL,
    muted_text_color      VARCHAR(7) NOT NULL,
    heading_large_color   VARCHAR(7) NOT NULL DEFAULT '#1a1a2e',
    heading_medium_color  VARCHAR(7) NOT NULL DEFAULT '#2d2d44',
    body_text_color       VARCHAR(7) NOT NULL DEFAULT '#4a4a68',
    button_color          VARCHAR(7) NOT NULL DEFAULT '#0F766E',
    button_text_color     VARCHAR(7) NOT NULL DEFAULT '#FFFFFF',
    created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
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
-- 3. USUARIOS
-- ============================================================================

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
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id BIGINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

-- ============================================================================
-- 4. AÑOS ACADÉMICOS Y PERÍODOS
-- ============================================================================

CREATE TABLE academic_years (
    id          BIGSERIAL PRIMARY KEY,
    year        INTEGER NOT NULL UNIQUE,
    active      BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE academic_periods (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(120) NOT NULL,
    start_date  DATE NOT NULL,
    end_date    DATE NOT NULL,
    active      BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 5. ASIGNATURAS
-- ============================================================================

CREATE TABLE subjects (
    id              BIGSERIAL PRIMARY KEY,
    name            VARCHAR(150) NOT NULL,
    code            VARCHAR(30) NOT NULL UNIQUE,
    curriculum_area VARCHAR(255) NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 6. DÍAS Y MODALIDADES
-- ============================================================================

CREATE TABLE school_days (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL UNIQUE,
    active      BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE school_modalities (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL UNIQUE,
    active      BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 7. CURSOS
-- ============================================================================

CREATE TABLE courses (
    id                  BIGSERIAL PRIMARY KEY,
    name                VARCHAR(100) NOT NULL,
    parallel            VARCHAR(5) NOT NULL,
    level               VARCHAR(50) NOT NULL,
    section             VARCHAR(20),
    sub_level           VARCHAR(20),
    grade               INTEGER,
    capacity            INTEGER,
    week_student_id     BIGINT REFERENCES students(id),
    academic_year_id    BIGINT REFERENCES academic_years(id),
    school_day_id       BIGINT REFERENCES school_days(id),
    school_modality_id  BIGINT REFERENCES school_modalities(id),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT courses_section_check CHECK (section IN ('INICIAL', 'EGB', 'BACHILLERATO')),
    CONSTRAINT courses_sub_level_check CHECK (sub_level IN ('INICIAL', 'PREPARATORIA', 'ELEMENTAL', 'MEDIA', 'SUPERIOR', 'BGU')),
    CONSTRAINT uk_course_sublevel_grade_parallel_year UNIQUE (sub_level, grade, parallel, academic_year_id)
);

-- ============================================================================
-- 8. DOCENTES
-- ============================================================================

CREATE TABLE teachers (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL UNIQUE REFERENCES users(id),
    specialization  VARCHAR(120) NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE teacher_subjects (
    teacher_id  BIGINT NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
    subject     VARCHAR(150) NOT NULL,
    PRIMARY KEY (teacher_id, subject)
);

CREATE TABLE teacher_courses (
    teacher_id  BIGINT NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
    course      VARCHAR(150) NOT NULL,
    PRIMARY KEY (teacher_id, course)
);

-- ============================================================================
-- 9. ESTUDIANTES
-- ============================================================================

CREATE TABLE students (
    id                  BIGSERIAL PRIMARY KEY,
    user_id             BIGINT NOT NULL UNIQUE REFERENCES users(id),
    course_id           BIGINT NOT NULL REFERENCES courses(id),
    enrollment_number   VARCHAR(30) NOT NULL,
    birth_date          DATE,
    gender              VARCHAR(5),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_student_gender CHECK (gender IN ('M', 'F', 'OTRO'))
);

-- FK de courses.week_student_id (deferred porque students se crea después)
ALTER TABLE courses ADD CONSTRAINT fk_courses_week_student
    FOREIGN KEY (week_student_id) REFERENCES students(id);

-- ============================================================================
-- 10. RESPONSABLES
-- ============================================================================

CREATE TABLE representatives (
    id                  BIGSERIAL PRIMARY KEY,
    student_id          BIGINT NOT NULL,
    full_name           VARCHAR(200) NOT NULL,
    relationship        VARCHAR(80),
    phone               VARCHAR(30),
    email               VARCHAR(120),
    emergency_contact   VARCHAR(200),
    emergency_phone     VARCHAR(30),
    address             VARCHAR(300),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 11. ASIGNACIÓN SEMANERO
-- ============================================================================

CREATE TABLE week_student_assignments (
    id          BIGSERIAL PRIMARY KEY,
    course_id   BIGINT NOT NULL REFERENCES courses(id),
    student_id  BIGINT NOT NULL REFERENCES students(id),
    start_date  DATE NOT NULL,
    end_date    DATE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 12. BLOQUES HORARIOS
-- ============================================================================

CREATE TABLE schedule_blocks (
    id          BIGSERIAL PRIMARY KEY,
    label       VARCHAR(80) NOT NULL,
    start_time  TIME NOT NULL,
    end_time    TIME NOT NULL,
    block_order INTEGER NOT NULL,
    block_type  VARCHAR(20) NOT NULL,
    active      BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_schedule_blocks_type CHECK (block_type IN ('CLASS', 'RECESS'))
);

-- ============================================================================
-- 13. HORARIOS DE CURSOS
-- ============================================================================

CREATE TABLE course_schedules (
    id                BIGSERIAL PRIMARY KEY,
    course_id         BIGINT NOT NULL REFERENCES courses(id),
    period_id         BIGINT NOT NULL REFERENCES academic_periods(id),
    schedule_block_id BIGINT NOT NULL REFERENCES schedule_blocks(id),
    subject_id        BIGINT NOT NULL REFERENCES subjects(id),
    teacher_id        BIGINT NOT NULL REFERENCES teachers(id),
    weekday           SMALLINT NOT NULL,
    classroom         VARCHAR(80),
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_course_schedules_weekday CHECK (weekday BETWEEN 1 AND 7)
);

-- ============================================================================
-- 14. PLANES DE LECCIÓN
-- ============================================================================

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

-- ============================================================================
-- 15. LECCIONARIOS DIARIOS
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
    closed_at       TIMESTAMPTZ,
    created_by      BIGINT NOT NULL REFERENCES users(id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_daily_logs_status CHECK (status IN ('DRAFT', 'CLOSED', 'SIGNED'))
);

-- ============================================================================
-- 16. ENTRADAS DEL LECCIONARIO (bloques por hora)
-- ============================================================================

CREATE TABLE daily_log_entries (
    id                        BIGSERIAL PRIMARY KEY,
    daily_log_id              BIGINT NOT NULL REFERENCES daily_logs(id) ON DELETE CASCADE,
    schedule_block_id         BIGINT NOT NULL REFERENCES schedule_blocks(id),
    teacher_id                BIGINT REFERENCES teachers(id),
    subject_id                BIGINT REFERENCES subjects(id),
    didactic_unit             VARCHAR(250),
    topic                     VARCHAR(300),
    close_token               VARCHAR(80) NOT NULL UNIQUE,
    teacher_signature_status  VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    teacher_closed_at         TIMESTAMPTZ,
    specific_notes            TEXT,
    general_notes             TEXT,
    created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_daily_log_entries UNIQUE (daily_log_id, schedule_block_id),
    CONSTRAINT chk_daily_log_teacher_signature CHECK (teacher_signature_status IN ('PENDING', 'SIGNED'))
);

-- ============================================================================
-- 17. INASISTENCIAS
-- ============================================================================

CREATE TABLE daily_log_student_absences (
    id                  BIGSERIAL PRIMARY KEY,
    daily_log_entry_id  BIGINT NOT NULL REFERENCES daily_log_entries(id) ON DELETE CASCADE,
    student_id          BIGINT NOT NULL REFERENCES students(id),
    absence_type        VARCHAR(20) NOT NULL DEFAULT 'ABSENT',
    notes               VARCHAR(300),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_daily_log_absence UNIQUE (daily_log_entry_id, student_id),
    CONSTRAINT chk_daily_log_absence_type CHECK (absence_type IN ('ABSENT', 'LATE', 'JUSTIFIED'))
);

-- ============================================================================
-- 18. NOVEDADES / INCIDENTES DEL LECCIONARIO
-- ============================================================================

CREATE TABLE daily_log_student_incidents (
    id                  BIGSERIAL PRIMARY KEY,
    daily_log_entry_id  BIGINT NOT NULL REFERENCES daily_log_entries(id) ON DELETE CASCADE,
    student_id          BIGINT NOT NULL REFERENCES students(id),
    demerit_id          BIGINT REFERENCES demerits(id),
    category            VARCHAR(80) NOT NULL,
    notes               VARCHAR(400),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_daily_log_incident UNIQUE (daily_log_entry_id, student_id)
);

-- ============================================================================
-- 19. FIRMAS DEL LECCIONARIO
-- ============================================================================

CREATE TABLE daily_log_signatures (
    id              BIGSERIAL PRIMARY KEY,
    daily_log_id    BIGINT NOT NULL REFERENCES daily_logs(id) ON DELETE CASCADE,
    signer_user_id  BIGINT NOT NULL REFERENCES users(id),
    signer_role     VARCHAR(40) NOT NULL,
    signature_type  VARCHAR(30) NOT NULL,
    signed_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    notes           VARCHAR(300),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_daily_log_signature_type CHECK (signature_type IN ('TEACHER_TUTOR', 'WEEK_STUDENT', 'GENERAL_INSPECTOR'))
);

-- ============================================================================
-- 20. MÓDULO DE DEMÉRITOS (LEGADO - behavior_*)
-- ============================================================================

CREATE TABLE behavior_categories (
    id          BIGSERIAL PRIMARY KEY,
    code        VARCHAR(10) NOT NULL UNIQUE,
    name        VARCHAR(250) NOT NULL,
    description VARCHAR(500),
    active      BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE behavior_offenses (
    id              BIGSERIAL PRIMARY KEY,
    category_id     BIGINT NOT NULL REFERENCES behavior_categories(id),
    literal         VARCHAR(10) NOT NULL,
    description     VARCHAR(600) NOT NULL,
    demerit_points  INTEGER NOT NULL,
    severity_level  VARCHAR(20),
    active          BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_behavior_offense UNIQUE (category_id, literal)
);

CREATE TABLE student_demerits (
    id              BIGSERIAL PRIMARY KEY,
    student_id      BIGINT NOT NULL REFERENCES students(id),
    course_id       BIGINT NOT NULL REFERENCES courses(id),
    period_id       BIGINT NOT NULL REFERENCES academic_periods(id),
    offense_id      BIGINT NOT NULL REFERENCES behavior_offenses(id),
    recorded_by     BIGINT NOT NULL REFERENCES users(id),
    demerit_date    DATE NOT NULL,
    quantity        INTEGER NOT NULL DEFAULT 1,
    notes           VARCHAR(500),
    status          VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_student_demerits_status CHECK (status IN ('ACTIVE', 'ANNULLED'))
);

-- ============================================================================
-- 21. DEMÉRITOS (catálogo simple)
-- ============================================================================

CREATE TABLE demerits (
    id          BIGSERIAL PRIMARY KEY,
    code        VARCHAR(30) NOT NULL UNIQUE,
    category    VARCHAR(80) NOT NULL,
    description VARCHAR(300) NOT NULL,
    score       SMALLINT NOT NULL,
    active      BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 22. NUEVO MÓDULO DE DEMÉRITOS (V9)
-- ============================================================================

CREATE TABLE demerit_categories (
    id              BIGSERIAL PRIMARY KEY,
    code            VARCHAR(20) UNIQUE NOT NULL,
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
    score                       SMALLINT NOT NULL CHECK (score BETWEEN 1 AND 100),
    severity                    VARCHAR(20) NOT NULL DEFAULT 'MEDIA' CHECK (severity IN ('LEVE','MEDIA','GRAVE','MUY_GRAVE')),
    requires_observation        BOOLEAN NOT NULL DEFAULT FALSE,
    requires_evidence           BOOLEAN NOT NULL DEFAULT FALSE,
    requires_representative     BOOLEAN NOT NULL DEFAULT FALSE,
    active                      BOOLEAN NOT NULL DEFAULT TRUE,
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_falta_category_code UNIQUE (category_id, code)
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
    status          VARCHAR(30) NOT NULL DEFAULT 'CREADO' CHECK (status IN ('CREADO','VALIDADO','APELADO','ANULADO','APROBADO')),
    created_by      VARCHAR(100),
    updated_by      VARCHAR(100),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE student_demer_details (
    id                  BIGSERIAL PRIMARY KEY,
    student_demer_id    BIGINT NOT NULL REFERENCES student_demers(id) ON DELETE CASCADE,
    falta_id            BIGINT NOT NULL REFERENCES demerit_faltas(id),
    quantity            SMALLINT NOT NULL DEFAULT 1,
    score               SMALLINT NOT NULL,
    subtotal            SMALLINT NOT NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE demerit_evidences (
    id                  BIGSERIAL PRIMARY KEY,
    student_demer_id    BIGINT NOT NULL REFERENCES student_demers(id) ON DELETE CASCADE,
    file_name           VARCHAR(255) NOT NULL,
    file_path           VARCHAR(500) NOT NULL,
    file_type           VARCHAR(50),
    uploaded_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE demerit_status_history (
    id                  BIGSERIAL PRIMARY KEY,
    student_demer_id    BIGINT NOT NULL REFERENCES student_demers(id) ON DELETE CASCADE,
    changed_by          VARCHAR(100) NOT NULL,
    changed_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    previous_status     VARCHAR(30),
    new_status          VARCHAR(30) NOT NULL,
    notes               VARCHAR(500)
);

-- Vista materializada: acumulado por estudiante por período
CREATE MATERIALIZED VIEW demerit_accumulated AS
SELECT
    sd.student_id,
    sd.period_id,
    COUNT(*)                              AS total_incidents,
    COALESCE(SUM(sd.total_score), 0)      AS total_score,
    COUNT(*) FILTER (WHERE EXISTS (
        SELECT 1 FROM student_demer_details ddd
        JOIN demerit_faltas df ON df.id = ddd.falta_id
        WHERE ddd.student_demer_id = sd.id AND df.severity = 'GRAVE'
    ))                                    AS grave_count,
    COUNT(*) FILTER (WHERE EXISTS (
        SELECT 1 FROM student_demer_details ddd
        JOIN demerit_faltas df ON df.id = ddd.falta_id
        WHERE ddd.student_demer_id = sd.id AND df.severity = 'LEVE'
    ))                                    AS leve_count,
    COUNT(*) FILTER (WHERE EXISTS (
        SELECT 1 FROM student_demer_details ddd
        JOIN demerit_faltas df ON df.id = ddd.falta_id
        WHERE ddd.student_demer_id = sd.id AND df.severity = 'MEDIA'
    ))                                    AS media_count,
    COUNT(*) FILTER (WHERE EXISTS (
        SELECT 1 FROM student_demer_details ddd
        JOIN demerit_faltas df ON df.id = ddd.falta_id
        WHERE ddd.student_demer_id = sd.id AND df.severity = 'MUY_GRAVE'
    ))                                    AS muy_grave_count
FROM student_demers sd
WHERE sd.status != 'ANULADO'
GROUP BY sd.student_id, sd.period_id;

CREATE UNIQUE INDEX idx_demerit_accumulated_pk
    ON demerit_accumulated (student_id, period_id);

-- ============================================================================
-- 23. EVALUACIONES
-- ============================================================================

CREATE TABLE evaluations (
    id              BIGSERIAL PRIMARY KEY,
    lesson_plan_id  BIGINT NOT NULL REFERENCES lesson_plans(id),
    student_id      BIGINT NOT NULL REFERENCES students(id),
    evaluation_type VARCHAR(120) NOT NULL,
    score           NUMERIC(5,2) NOT NULL,
    feedback        VARCHAR(500),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 24. ANUNCIOS (V12-V14)
-- ============================================================================

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
    announcement_id BIGINT NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
    user_id         BIGINT NOT NULL REFERENCES users(id),
    is_read         BOOLEAN NOT NULL DEFAULT FALSE,
    read_at         TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_announcement_user UNIQUE (announcement_id, user_id)
);

CREATE TABLE announcement_schedules (
    id                  BIGSERIAL PRIMARY KEY,
    announcement_id     BIGINT NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
    schedule_date       DATE NOT NULL,
    weekday             SMALLINT NOT NULL,
    schedule_block_id   BIGINT NOT NULL REFERENCES schedule_blocks(id),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_announcement_schedule UNIQUE (announcement_id, schedule_date, schedule_block_id),
    CONSTRAINT chk_announcement_schedules_weekday CHECK (weekday BETWEEN 1 AND 7)
);

-- ============================================================================
-- 25. AUDITORÍA
-- ============================================================================

CREATE TABLE logs (
    id          BIGSERIAL PRIMARY KEY,
    username    VARCHAR(120) NOT NULL,
    action      VARCHAR(100) NOT NULL,
    module      VARCHAR(100) NOT NULL,
    details     VARCHAR(1500),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- ÍNDICES
-- ============================================================================

CREATE INDEX idx_users_institution ON users(institution_id);
CREATE INDEX idx_branding_slides_institution_order ON institution_carousel_slides(institution_id, slide_order);
CREATE INDEX idx_students_course ON students(course_id);
CREATE INDEX idx_students_enrollment ON students(enrollment_number);
CREATE INDEX idx_course_schedules_course_weekday ON course_schedules(course_id, weekday);
CREATE INDEX idx_course_schedules_teacher ON course_schedules(teacher_id);
CREATE INDEX idx_course_schedules_period ON course_schedules(period_id);
CREATE INDEX idx_daily_logs_course_date ON daily_logs(course_id, log_date);
CREATE INDEX idx_daily_log_entries_log_block ON daily_log_entries(daily_log_id, schedule_block_id);
CREATE INDEX idx_daily_log_entries_teacher ON daily_log_entries(teacher_id);
CREATE INDEX idx_daily_log_absences_student ON daily_log_student_absences(student_id);
CREATE INDEX idx_daily_log_incidents_student ON daily_log_student_incidents(student_id);
CREATE INDEX idx_daily_log_incidents_demerit ON daily_log_student_incidents(demerit_id);
CREATE INDEX idx_behavior_offenses_category ON behavior_offenses(category_id);
CREATE INDEX idx_student_demerits_student_date ON student_demerits(student_id, demerit_date);
CREATE INDEX idx_lesson_plans_teacher_date ON lesson_plans(teacher_id, lesson_date);
CREATE INDEX idx_lesson_plans_course_date ON lesson_plans(course_id, lesson_date);
CREATE INDEX idx_evaluations_student ON evaluations(student_id);
CREATE INDEX idx_logs_module_created_at ON logs(module, created_at);
CREATE INDEX idx_demerit_faltas_category ON demerit_faltas(category_id);
CREATE INDEX idx_student_demers_student ON student_demers(student_id);
CREATE INDEX idx_student_demers_period ON student_demers(period_id);
CREATE INDEX idx_student_demers_status ON student_demers(status);
CREATE INDEX idx_student_demer_details_demer ON student_demer_details(student_demer_id);
CREATE INDEX idx_student_demer_details_falta ON student_demer_details(falta_id);
CREATE INDEX idx_demerit_evidences_demer ON demerit_evidences(student_demer_id);
CREATE INDEX idx_demerit_status_history_demer ON demerit_status_history(student_demer_id);
CREATE INDEX idx_announcements_event_date ON announcements(event_date);
CREATE INDEX idx_announcements_course ON announcements(course_id);
CREATE INDEX idx_announcements_type ON announcements(announcement_type);
CREATE INDEX idx_announcement_recipients_user ON announcement_recipients(user_id);
CREATE INDEX idx_announcement_recipients_unread ON announcement_recipients(user_id, is_read);
CREATE INDEX idx_announcement_schedules_announcement ON announcement_schedules(announcement_id);
CREATE INDEX idx_announcement_schedules_date ON announcement_schedules(schedule_date);
CREATE INDEX idx_announcement_schedules_weekday ON announcement_schedules(weekday);
CREATE INDEX idx_week_student_assignments_course ON week_student_assignments(course_id);
