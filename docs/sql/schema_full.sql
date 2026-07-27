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

-- ============================================================================
-- V16: LIBRETAS (REPORT CARDS) + HISTORIAL ACADEMICO
-- ============================================================================

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

CREATE INDEX idx_report_cards_student ON report_cards(student_id);
CREATE INDEX idx_report_cards_course ON report_cards(course_id);
CREATE INDEX idx_report_cards_period ON report_cards(academic_period_id);
CREATE INDEX idx_report_cards_status ON report_cards(status);
CREATE INDEX idx_rc_details_report ON report_card_details(report_card_id);
CREATE INDEX idx_rc_details_subject ON report_card_details(subject_id);

-- ============================================================================
-- V17: CERTIFICADOS ACADEMICOS
-- ============================================================================

CREATE TABLE certificate_templates (
    id                  BIGSERIAL PRIMARY KEY,
    institution_id      BIGINT NOT NULL REFERENCES institutions(id),
    name                VARCHAR(150) NOT NULL,
    template_type       VARCHAR(30) NOT NULL
                        CHECK (template_type IN ('ESTUDIOS', 'NOTAS', 'CONDUCTA', 'PROMOCION', 'OTRO')),
    description         VARCHAR(500),
    header_text         TEXT,
    footer_text         TEXT,
    requires_grades     BOOLEAN NOT NULL DEFAULT FALSE,
    requires_conduct    BOOLEAN NOT NULL DEFAULT FALSE,
    active              BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_cert_template_name_inst UNIQUE (institution_id, name)
);

CREATE TABLE certificates (
    id                      BIGSERIAL PRIMARY KEY,
    institution_id          BIGINT NOT NULL REFERENCES institutions(id),
    template_id             BIGINT NOT NULL REFERENCES certificate_templates(id),
    student_id              BIGINT NOT NULL REFERENCES students(id),
    course_id               BIGINT REFERENCES courses(id),
    academic_period_id      BIGINT REFERENCES academic_periods(id),
    certificate_number      VARCHAR(50) NOT NULL UNIQUE,
    status                  VARCHAR(20) NOT NULL DEFAULT 'DRAFT'
                            CHECK (status IN ('DRAFT', 'ISSUED', 'REVOKED')),
    issued_at               TIMESTAMPTZ,
    issued_by               VARCHAR(100),
    valid_until             DATE,
    observations            TEXT,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE certificate_details (
    id                  BIGSERIAL PRIMARY KEY,
    certificate_id      BIGINT NOT NULL REFERENCES certificates(id) ON DELETE CASCADE,
    subject_name        VARCHAR(150),
    score               DECIMAL(5,2),
    status              VARCHAR(20),
    observation         VARCHAR(300),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_cert_templates_institution ON certificate_templates(institution_id);
CREATE INDEX idx_certificates_institution ON certificates(institution_id);
CREATE INDEX idx_certificates_student ON certificates(student_id);
CREATE INDEX idx_certificates_template ON certificates(template_id);
CREATE INDEX idx_certificates_number ON certificates(certificate_number);
CREATE INDEX idx_cert_details_certificate ON certificate_details(certificate_id);

-- ============================================================================
-- V18: MERITOS + VISTA DE CONDUCTA
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
    CONSTRAINT uq_merit_category_name_inst UNIQUE (institution_id, name)
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

CREATE OR REPLACE VIEW v_student_conduct AS
SELECT
    s.id AS student_id,
    u.first_name || ' ' || u.last_name AS student_name,
    s.enrollment_number,
    c.id AS course_id,
    c.name AS course_name,
    ap.id AS period_id,
    ap.name AS period_name,
    COALESCE(merit.total_points, 0) AS merit_points,
    COALESCE(demerit.total_points, 0) AS demerit_points,
    COALESCE(merit.total_points, 0) - COALESCE(demerit.total_points, 0) AS conduct_balance,
    COALESCE(merit.merit_count, 0) AS merit_count,
    COALESCE(demerit.demerit_count, 0) AS demerit_count
FROM students s
JOIN users u ON u.id = s.user_id
JOIN courses c ON c.id = s.course_id
JOIN academic_periods ap ON ap.active = TRUE
LEFT JOIN (
    SELECT sm.student_id, sm.course_id, sm.academic_period_id,
           SUM(sm.points) AS total_points, COUNT(*) AS merit_count
    FROM student_merits sm
    GROUP BY sm.student_id, sm.course_id, sm.academic_period_id
) merit ON merit.student_id = s.id AND merit.course_id = c.id AND merit.academic_period_id = ap.id
LEFT JOIN (
    SELECT sd.student_id, sd.course_id, sd.academic_period_id,
           SUM(df.demerit_points) AS total_points, COUNT(*) AS demerit_count
    FROM student_demers sd
    JOIN student_demer_details sdd ON sdd.student_demer_id = sd.id
    JOIN demerit_faltas df ON df.id = sdd.falta_id
    WHERE sd.status = 'ACTIVE'
    GROUP BY sd.student_id, sd.course_id, sd.academic_period_id
) demerit ON demerit.student_id = s.id AND demerit.course_id = c.id AND demerit.academic_period_id = ap.id;

CREATE INDEX idx_merit_categories_institution ON merit_categories(institution_id);
CREATE INDEX idx_student_merits_student ON student_merits(student_id);
CREATE INDEX idx_student_merits_course ON student_merits(course_id);
CREATE INDEX idx_student_merits_period ON student_merits(academic_period_id);
CREATE INDEX idx_student_merits_date ON student_merits(merit_date);
CREATE INDEX idx_student_merits_category ON student_merits(category_id);

-- ============================================================================
-- V19: TUTORIAS
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
    session_type        VARCHAR(30) NOT NULL DEFAULT 'ACADEMICA'
                        CHECK (session_type IN ('ACADEMICA', 'CONDUCTUAL', 'ORIENTACION', 'FAMILIAR', 'OTRO')),
    status              VARCHAR(20) NOT NULL DEFAULT 'PROGRAMADA'
                        CHECK (status IN ('PROGRAMADA', 'REALIZADA', 'CANCELADA', 'REPROGRAMADA')),
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
    id                  BIGSERIAL PRIMARY KEY,
    session_id          BIGINT NOT NULL REFERENCES tutoring_sessions(id) ON DELETE CASCADE,
    follow_up_date      DATE NOT NULL,
    notes               TEXT NOT NULL,
    status              VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE'
                        CHECK (status IN ('PENDIENTE', 'COMPLETADO')),
    completed_at        TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tutoring_sessions_institution ON tutoring_sessions(institution_id);
CREATE INDEX idx_tutoring_sessions_teacher ON tutoring_sessions(teacher_id);
CREATE INDEX idx_tutoring_sessions_student ON tutoring_sessions(student_id);
CREATE INDEX idx_tutoring_sessions_course ON tutoring_sessions(course_id);
CREATE INDEX idx_tutoring_sessions_period ON tutoring_sessions(academic_period_id);
CREATE INDEX idx_tutoring_sessions_date ON tutoring_sessions(session_date);
CREATE INDEX idx_tutoring_sessions_status ON tutoring_sessions(status);
CREATE INDEX idx_tutoring_follow_ups_session ON tutoring_follow_ups(session_id);

-- ============================================================================
-- V20: BANCO DE PREGUNTAS
-- ============================================================================

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

CREATE INDEX idx_question_categories_institution ON question_categories(institution_id);
CREATE INDEX idx_questions_institution ON questions(institution_id);
CREATE INDEX idx_questions_subject ON questions(subject_id);
CREATE INDEX idx_questions_category ON questions(category_id);
CREATE INDEX idx_questions_type ON questions(question_type);
CREATE INDEX idx_questions_difficulty ON questions(difficulty);

-- ============================================================================
-- V21: MATRICULAS, NEE, ADAPTACIONES CURRICULARES, DECE
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

-- ============================================================================
-- V22: GESTION INSTITUCIONAL
-- ============================================================================

CREATE TABLE campus (
    id                  BIGSERIAL PRIMARY KEY,
    institution_id      BIGINT NOT NULL REFERENCES institutions(id),
    name                VARCHAR(200) NOT NULL,
    code                VARCHAR(20),
    address             VARCHAR(300),
    latitude            DECIMAL(10,7),
    longitude           DECIMAL(10,7),
    phone               VARCHAR(20),
    email               VARCHAR(150),
    campus_type         VARCHAR(20) NOT NULL DEFAULT 'PRINCIPAL'
                        CHECK (campus_type IN ('PRINCIPAL', 'SEDE', 'ANEXO')),
    active              BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_campus_code_inst UNIQUE (institution_id, code)
);

CREATE INDEX idx_campus_institution ON campus(institution_id);

CREATE TABLE shifts (
    id                  BIGSERIAL PRIMARY KEY,
    institution_id      BIGINT NOT NULL REFERENCES institutions(id),
    name                VARCHAR(100) NOT NULL,
    code                VARCHAR(10) NOT NULL,
    start_time          TIME NOT NULL,
    end_time            TIME NOT NULL,
    shift_type          VARCHAR(15) NOT NULL DEFAULT 'REGULAR'
                        CHECK (shift_type IN ('REGULAR', 'COMPLEMENTARIA', 'ESPECIAL')),
    active              BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_shift_code_inst UNIQUE (institution_id, code)
);

CREATE INDEX idx_shifts_institution ON shifts(institution_id);

CREATE TABLE classrooms (
    id                  BIGSERIAL PRIMARY KEY,
    institution_id      BIGINT NOT NULL REFERENCES institutions(id),
    campus_id           BIGINT REFERENCES campus(id),
    shift_id            BIGINT REFERENCES shifts(id),
    name                VARCHAR(100) NOT NULL,
    code                VARCHAR(20) NOT NULL,
    classroom_type      VARCHAR(20) NOT NULL DEFAULT 'AULA'
                        CHECK (classroom_type IN ('AULA', 'LABORATORIO', 'TALLER', 'AUDITORIO', 'BIBLIOTECA', 'CANCHA', 'OTRO')),
    capacity            INT DEFAULT 0,
    floor               VARCHAR(10),
    wing                 VARCHAR(10),
    has_projector       BOOLEAN DEFAULT FALSE,
    has_computers       BOOLEAN DEFAULT FALSE,
    computer_count      INT DEFAULT 0,
    has_internet        BOOLEAN DEFAULT FALSE,
    active              BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_classroom_code_inst UNIQUE (institution_id, code)
);

CREATE INDEX idx_classrooms_institution ON classrooms(institution_id);
CREATE INDEX idx_classrooms_campus ON classrooms(campus_id);
CREATE INDEX idx_classrooms_type ON classrooms(classroom_type);

CREATE TABLE school_calendar_events (
    id                  BIGSERIAL PRIMARY KEY,
    institution_id      BIGINT NOT NULL REFERENCES institutions(id),
    academic_year_id    BIGINT REFERENCES academic_years(id),
    event_name          VARCHAR(200) NOT NULL,
    event_type          VARCHAR(20) NOT NULL
                        CHECK (event_type IN ('INSTITUCIONAL', 'ACADEMICO', 'FERIADO', 'VACACIONES', 'EVALUACION', 'EXCURSION', 'CAPACITACION', 'OTRO')),
    start_date          DATE NOT NULL,
    end_date            DATE NOT NULL,
    description         TEXT,
    is_recurrent        BOOLEAN DEFAULT FALSE,
    recurrence_rule     VARCHAR(100),
    color               VARCHAR(7),
    active              BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_calendar_events_institution ON school_calendar_events(institution_id);
CREATE INDEX idx_calendar_events_year ON school_calendar_events(academic_year_id);
CREATE INDEX idx_calendar_events_dates ON school_calendar_events(start_date, end_date);
CREATE INDEX idx_calendar_events_type ON school_calendar_events(event_type);

CREATE TABLE institution_settings (
    id                  BIGSERIAL PRIMARY KEY,
    institution_id      BIGINT NOT NULL REFERENCES institutions(id),
    setting_key         VARCHAR(100) NOT NULL,
    setting_value       TEXT,
    setting_type        VARCHAR(15) NOT NULL DEFAULT 'STRING'
                        CHECK (setting_type IN ('STRING', 'NUMBER', 'BOOLEAN', 'JSON')),
    category            VARCHAR(50),
    description         VARCHAR(300),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_setting_key_inst UNIQUE (institution_id, setting_key)
);

CREATE INDEX idx_settings_institution ON institution_settings(institution_id);
CREATE INDEX idx_settings_category ON institution_settings(category);

-- ============================================================================
-- V23: RECURSOS HUMANOS
-- ============================================================================

CREATE TABLE employees (
    id                  BIGSERIAL PRIMARY KEY,
    user_id             BIGINT REFERENCES users(id),
    institution_id      BIGINT NOT NULL REFERENCES institutions(id),
    employee_number     VARCHAR(20) NOT NULL,
    first_name          VARCHAR(100) NOT NULL,
    last_name           VARCHAR(100) NOT NULL,
    identification      VARCHAR(20) NOT NULL,
    id_type             VARCHAR(15) NOT NULL DEFAULT 'CEDULA'
                        CHECK (id_type IN ('CEDULA', 'RUC', 'PASSPORT', 'EXT')),
    birth_date          DATE,
    gender              VARCHAR(10) CHECK (gender IN ('M', 'F', 'OTRO')),
    civil_status        VARCHAR(15) CHECK (civil_status IN ('SOLTERO', 'CASADO', 'DIVORCIADO', 'VIUDO', 'UNION_LIBRE')),
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
    status              VARCHAR(15) NOT NULL DEFAULT 'ACTIVO'
                        CHECK (status IN ('ACTIVO', 'INACTIVO', 'VACACIONES', 'PERMISO', 'RETIRADO')),
    notes               TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_employee_number_inst UNIQUE (institution_id, employee_number),
    CONSTRAINT uq_employee_identification_inst UNIQUE (institution_id, identification)
);

CREATE INDEX idx_employees_institution ON employees(institution_id);
CREATE INDEX idx_employees_status ON employees(status);
CREATE INDEX idx_employees_user ON employees(user_id);

CREATE TABLE employment_contracts (
    id                  BIGSERIAL PRIMARY KEY,
    employee_id         BIGINT NOT NULL REFERENCES employees(id),
    contract_number     VARCHAR(30) NOT NULL,
    contract_type       VARCHAR(20) NOT NULL DEFAULT 'INDEFINIDO'
                        CHECK (contract_type IN ('INDEFINIDO', 'FIJO', 'OBRA_SERVICIO', 'PRESTACION_SERVICIOS', 'PASANTE')),
    position            VARCHAR(150) NOT NULL,
    department          VARCHAR(100),
    salary              DECIMAL(10,2),
    salary_type         VARCHAR(15) NOT NULL DEFAULT 'MENSUAL'
                        CHECK (salary_type IN ('MENSUAL', 'QUINCENAL', 'SEMANAL', 'POR_HORA')),
    start_date          DATE NOT NULL,
    end_date            DATE,
    trial_period_days   INT DEFAULT 90,
    status              VARCHAR(15) NOT NULL DEFAULT 'ACTIVO'
                        CHECK (status IN ('ACTIVO', 'VENCIDO', 'TERMINADO', 'SUSPENDIDO')),
    termination_reason  TEXT,
    created_by          VARCHAR(100),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_contract_number UNIQUE (contract_number)
);

CREATE INDEX idx_contracts_employee ON employment_contracts(employee_id);
CREATE INDEX idx_contracts_status ON employment_contracts(status);

CREATE TABLE vacation_periods (
    id                  BIGSERIAL PRIMARY KEY,
    employee_id         BIGINT NOT NULL REFERENCES employees(id),
    year                INT NOT NULL,
    total_days          INT NOT NULL DEFAULT 15,
    used_days           INT NOT NULL DEFAULT 0,
    pending_days        INT GENERATED ALWAYS AS (total_days - used_days) STORED,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_vacation_period UNIQUE (employee_id, year)
);

CREATE TABLE vacation_requests (
    id                  BIGSERIAL PRIMARY KEY,
    employee_id         BIGINT NOT NULL REFERENCES employees(id),
    period_id           BIGINT NOT NULL REFERENCES vacation_periods(id),
    start_date          DATE NOT NULL,
    end_date            DATE NOT NULL,
    days_requested      INT NOT NULL,
    reason              TEXT,
    status              VARCHAR(15) NOT NULL DEFAULT 'PENDIENTE'
                        CHECK (status IN ('PENDIENTE', 'APROBADA', 'RECHAZADA', 'CANCELADA')),
    approved_by         VARCHAR(100),
    approval_date       DATE,
    observations        TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_vacation_periods_employee ON vacation_periods(employee_id);
CREATE INDEX idx_vacation_requests_employee ON vacation_requests(employee_id);
CREATE INDEX idx_vacation_requests_status ON vacation_requests(status);

CREATE TABLE staff_permissions (
    id                  BIGSERIAL PRIMARY KEY,
    employee_id         BIGINT NOT NULL REFERENCES employees(id),
    permission_type     VARCHAR(25) NOT NULL
                        CHECK (permission_type IN ('PERSONAL', 'MEDICO', 'FAMILIAR', 'EDUCATIVO', 'MATERNIDAD', 'PATERNIDAD', 'CALAMIDAD', 'OTRO')),
    start_date          DATE NOT NULL,
    end_date            DATE NOT NULL,
    hours_requested     DECIMAL(5,2),
    days_requested      INT,
    reason              TEXT NOT NULL,
    medical_certificate BOOLEAN DEFAULT FALSE,
    status              VARCHAR(15) NOT NULL DEFAULT 'PENDIENTE'
                        CHECK (status IN ('PENDIENTE', 'APROBADO', 'RECHAZADO', 'CANCELADO')),
    approved_by         VARCHAR(100),
    approval_date       DATE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_staff_permissions_employee ON staff_permissions(employee_id);
CREATE INDEX idx_staff_permissions_status ON staff_permissions(status);

CREATE TABLE training_courses (
    id                  BIGSERIAL PRIMARY KEY,
    institution_id      BIGINT NOT NULL REFERENCES institutions(id),
    name                VARCHAR(200) NOT NULL,
    description         TEXT,
    provider            VARCHAR(200),
    course_type         VARCHAR(20) NOT NULL DEFAULT 'INTERNO'
                        CHECK (course_type IN ('INTERNO', 'EXTERNO', 'ONLINE', 'TALLER', 'SEMINARIO')),
    hours               DECIMAL(5,2),
    start_date          DATE,
    end_date            DATE,
    max_participants    INT,
    status              VARCHAR(15) NOT NULL DEFAULT 'PLANIFICADO'
                        CHECK (status IN ('PLANIFICADO', 'EN_CURSO', 'FINALIZADO', 'CANCELADO')),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE training_enrollments (
    id                  BIGSERIAL PRIMARY KEY,
    course_id           BIGINT NOT NULL REFERENCES training_courses(id) ON DELETE CASCADE,
    employee_id         BIGINT NOT NULL REFERENCES employees(id),
    enrollment_date     DATE NOT NULL DEFAULT CURRENT_DATE,
    completion_date     DATE,
    grade               DECIMAL(5,2),
    certificate_url     VARCHAR(300),
    status              VARCHAR(15) NOT NULL DEFAULT 'INSCRITO'
                        CHECK (status IN ('INSCRITO', 'EN_CURSO', 'COMPLETADO', 'ABANDONO')),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_training_enrollment UNIQUE (course_id, employee_id)
);

CREATE INDEX idx_training_courses_institution ON training_courses(institution_id);
CREATE INDEX idx_training_enrollments_course ON training_enrollments(course_id);
CREATE INDEX idx_training_enrollments_employee ON training_enrollments(employee_id);

-- ============================================================================
-- V24: GESTION ESTUDIANTIL
-- ============================================================================

CREATE TABLE student_health_records (
    id                  BIGSERIAL PRIMARY KEY,
    student_id          BIGINT NOT NULL REFERENCES students(id),
    blood_type          VARCHAR(5),
    weight_kg           DECIMAL(5,2),
    height_cm           DECIMAL(5,2),
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
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_student_health UNIQUE (student_id)
);

CREATE TABLE student_vaccinations (
    id                  BIGSERIAL PRIMARY KEY,
    student_id          BIGINT NOT NULL REFERENCES students(id),
    vaccine_name        VARCHAR(150) NOT NULL,
    dose_number         INT,
    dose_date           DATE NOT NULL,
    next_dose_date      DATE,
    lot_number          VARCHAR(50),
    administered_by     VARCHAR(200),
    institution         VARCHAR(200),
    status              VARCHAR(15) NOT NULL DEFAULT 'COMPLETADA'
                        CHECK (status IN ('COMPLETADA', 'PENDIENTE', 'PROGRAMADA')),
    notes               TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_student_health_student ON student_health_records(student_id);
CREATE INDEX idx_student_vaccinations_student ON student_vaccinations(student_id);

CREATE TABLE psychological_evaluations (
    id                  BIGSERIAL PRIMARY KEY,
    student_id          BIGINT NOT NULL REFERENCES students(id),
    evaluation_date     DATE NOT NULL DEFAULT CURRENT_DATE,
    evaluator_name      VARCHAR(200),
    evaluation_type     VARCHAR(30) NOT NULL
                        CHECK (evaluation_type IN ('INGRESO', 'SEGUIMIENTO', 'DIAGNOSTICO', 'ORIENTACION', 'TRIAL')),
    area                VARCHAR(100),
    findings            TEXT NOT NULL,
    recommendations     TEXT,
    risk_level          VARCHAR(10) DEFAULT 'BAJO'
                        CHECK (risk_level IN ('BAJO', 'MODERADO', 'ALTO', 'CRITICO')),
    follow_up_needed    BOOLEAN DEFAULT FALSE,
    follow_up_date      DATE,
    status              VARCHAR(15) NOT NULL DEFAULT 'COMPLETADA'
                        CHECK (status IN ('COMPLETADA', 'EN_PROCESO', 'PROGRAMADA')),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_psych_evaluations_student ON psychological_evaluations(student_id);
CREATE INDEX idx_psych_evaluations_risk ON psychological_evaluations(risk_level);

CREATE TABLE student_insurance (
    id                  BIGSERIAL PRIMARY KEY,
    student_id          BIGINT NOT NULL REFERENCES students(id),
    provider            VARCHAR(200) NOT NULL,
    policy_number       VARCHAR(50) NOT NULL,
    insurance_type      VARCHAR(20) NOT NULL DEFAULT 'BASICO'
                        CHECK (insurance_type IN ('BASICO', 'COMPLETO', 'ODONTOLOGICO', 'OPTICO')),
    start_date          DATE NOT NULL,
    end_date            DATE NOT NULL,
    coverage_details    TEXT,
    monthly_premium     DECIMAL(8,2),
    status              VARCHAR(15) NOT NULL DEFAULT 'ACTIVO'
                        CHECK (status IN ('ACTIVO', 'VENCIDO', 'CANCELADO')),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_student_insurance_student ON student_insurance(student_id);
CREATE INDEX idx_student_insurance_status ON student_insurance(status);

CREATE TABLE scholarship_types (
    id                  BIGSERIAL PRIMARY KEY,
    institution_id      BIGINT NOT NULL REFERENCES institutions(id),
    name                VARCHAR(150) NOT NULL,
    description         TEXT,
    coverage_percent    DECIMAL(5,2),
    coverage_amount     DECIMAL(10,2),
    criteria            TEXT,
    active              BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE scholarship_applications (
    id                  BIGSERIAL PRIMARY KEY,
    student_id          BIGINT NOT NULL REFERENCES students(id),
    type_id             BIGINT NOT NULL REFERENCES scholarship_types(id),
    academic_year_id    BIGINT REFERENCES academic_years(id),
    application_date    DATE NOT NULL DEFAULT CURRENT_DATE,
    justification       TEXT,
    family_income       DECIMAL(10,2),
    siblings_in_school  INT DEFAULT 0,
    gpa                 DECIMAL(4,2),
    documents_url       TEXT,
    status              VARCHAR(15) NOT NULL DEFAULT 'PENDIENTE'
                        CHECK (status IN ('PENDIENTE', 'EN_REVISION', 'APROBADA', 'RECHAZADA', 'SUSPENDIDA')),
    reviewed_by         VARCHAR(100),
    review_date         DATE,
    award_amount        DECIMAL(10,2),
    observations        TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_scholarship_types_institution ON scholarship_types(institution_id);
CREATE INDEX idx_scholarship_applications_student ON scholarship_applications(student_id);
CREATE INDEX idx_scholarship_applications_status ON scholarship_applications(status);

CREATE TABLE clubs (
    id                  BIGSERIAL PRIMARY KEY,
    institution_id      BIGINT NOT NULL REFERENCES institutions(id),
    name                VARCHAR(150) NOT NULL,
    description         TEXT,
    club_type           VARCHAR(20) NOT NULL DEFAULT 'DEPORTIVO'
                        CHECK (club_type IN ('DEPORTIVO', 'CULTURAL', 'ACADEMICO', 'SOCIAL', 'OTRO')),
    coordinator         VARCHAR(200),
    schedule_info       TEXT,
    max_members         INT,
    active              BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE club_memberships (
    id                  BIGSERIAL PRIMARY KEY,
    club_id             BIGINT NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
    student_id          BIGINT NOT NULL REFERENCES students(id),
    enrollment_date     DATE NOT NULL DEFAULT CURRENT_DATE,
    role                VARCHAR(20) DEFAULT 'MIEMBRO'
                        CHECK (role IN ('MIEMBRO', 'LIDER', 'DELEGADO', 'COORDINADOR')),
    status              VARCHAR(15) NOT NULL DEFAULT 'ACTIVO'
                        CHECK (status IN ('ACTIVO', 'INACTIVO', 'RETIRADO')),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_club_membership UNIQUE (club_id, student_id)
);

CREATE INDEX idx_clubs_institution ON clubs(institution_id);
CREATE INDEX idx_club_memberships_club ON club_memberships(club_id);
CREATE INDEX idx_club_memberships_student ON club_memberships(student_id);

CREATE TABLE transport_routes (
    id                  BIGSERIAL PRIMARY KEY,
    institution_id      BIGINT NOT NULL REFERENCES institutions(id),
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
    capacity            INT DEFAULT 0,
    vehicle_plate       VARCHAR(20),
    driver_name         VARCHAR(200),
    driver_phone        VARCHAR(20),
    monthly_fee         DECIMAL(8,2),
    status              VARCHAR(15) NOT NULL DEFAULT 'ACTIVA'
                        CHECK (status IN ('ACTIVA', 'INACTIVA', 'SUSPENDIDA')),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE transport_assignments (
    id                  BIGSERIAL PRIMARY KEY,
    route_id            BIGINT NOT NULL REFERENCES transport_routes(id),
    student_id          BIGINT NOT NULL REFERENCES students(id),
    academic_year_id    BIGINT REFERENCES academic_years(id),
    assignment_date     DATE NOT NULL DEFAULT CURRENT_DATE,
    pickup_point        VARCHAR(200),
    dropoff_point       VARCHAR(200),
    shift               VARCHAR(10) NOT NULL DEFAULT 'MATUTINO'
                        CHECK (shift IN ('MATUTINO', 'VESPERTINO', 'AMBOS')),
    monthly_fee         DECIMAL(8,2),
    status              VARCHAR(15) NOT NULL DEFAULT 'ACTIVO'
                        CHECK (status IN ('ACTIVO', 'INACTIVO', 'SUSPENDIDO')),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_transport_assignment UNIQUE (route_id, student_id, academic_year_id)
);

CREATE INDEX idx_transport_routes_institution ON transport_routes(institution_id);
CREATE INDEX idx_transport_assignments_route ON transport_assignments(route_id);
CREATE INDEX idx_transport_assignments_student ON transport_assignments(student_id);

-- ============================================================================
-- V25: GESTION FINANCIERA
-- ============================================================================

CREATE TABLE cash_registers (
    id              BIGSERIAL PRIMARY KEY,
    institution_id  BIGINT NOT NULL,
    register_date   DATE NOT NULL DEFAULT CURRENT_DATE,
    opening_balance DECIMAL(12,2) NOT NULL DEFAULT 0,
    closing_balance DECIMAL(12,2),
    total_income    DECIMAL(12,2) DEFAULT 0,
    total_expenses  DECIMAL(12,2) DEFAULT 0,
    status          VARCHAR(15) NOT NULL DEFAULT 'ABIERTA'
                    CHECK (status IN ('ABIERTA', 'CERRADA')),
    opened_by       VARCHAR(100),
    closed_by       VARCHAR(100),
    opened_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    closed_at       TIMESTAMPTZ,
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_cash_register UNIQUE (institution_id, register_date, status)
);

CREATE TABLE cash_transactions (
    id                BIGSERIAL PRIMARY KEY,
    register_id       BIGINT NOT NULL REFERENCES cash_registers(id) ON DELETE CASCADE,
    transaction_type  VARCHAR(10) NOT NULL CHECK (transaction_type IN ('INGRESO', 'EGRESO')),
    category          VARCHAR(50),
    description       TEXT NOT NULL,
    amount            DECIMAL(12,2) NOT NULL,
    payment_method    VARCHAR(20) DEFAULT 'EFECTIVO',
    reference_number  VARCHAR(50),
    student_id        BIGINT,
    invoice_id        BIGINT,
    created_by        VARCHAR(100),
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE invoices (
    id                BIGSERIAL PRIMARY KEY,
    institution_id    BIGINT NOT NULL,
    invoice_number    VARCHAR(30) NOT NULL,
    student_id        BIGINT NOT NULL,
    period_id         BIGINT,
    invoice_date      DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date          DATE,
    subtotal          DECIMAL(12,2) NOT NULL DEFAULT 0,
    iva_percent       DECIMAL(5,2) DEFAULT 12.00,
    iva_amount        DECIMAL(12,2) DEFAULT 0,
    total             DECIMAL(12,2) NOT NULL DEFAULT 0,
    paid_amount       DECIMAL(12,2) DEFAULT 0,
    status            VARCHAR(15) NOT NULL DEFAULT 'PENDIENTE'
                      CHECK (status IN ('PENDIENTE', 'PAGADA', 'PARCIAL', 'VENCIDA', 'ANULADA')),
    concept           VARCHAR(200),
    observations      TEXT,
    sri_auth_number   VARCHAR(50),
    sri_clave_acceso  VARCHAR(50),
    created_by        VARCHAR(100),
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_invoice_number UNIQUE (institution_id, invoice_number)
);

CREATE TABLE invoice_items (
    id            BIGSERIAL PRIMARY KEY,
    invoice_id    BIGINT NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    description   VARCHAR(300) NOT NULL,
    quantity      DECIMAL(8,2) NOT NULL DEFAULT 1,
    unit_price    DECIMAL(10,2) NOT NULL,
    subtotal      DECIMAL(12,2) NOT NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE tuition_plans (
    id              BIGSERIAL PRIMARY KEY,
    institution_id  BIGINT NOT NULL,
    name            VARCHAR(150) NOT NULL,
    description     TEXT,
    amount          DECIMAL(10,2) NOT NULL,
    iva_included    BOOLEAN DEFAULT TRUE,
    category        VARCHAR(50),
    active          BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE student_tuitions (
    id              BIGSERIAL PRIMARY KEY,
    student_id      BIGINT NOT NULL,
    plan_id         BIGINT NOT NULL REFERENCES tuition_plans(id),
    period_id       BIGINT NOT NULL,
    enrollment_id   BIGINT,
    total_amount    DECIMAL(12,2) NOT NULL,
    paid_amount     DECIMAL(12,2) DEFAULT 0,
    status          VARCHAR(15) NOT NULL DEFAULT 'ACTIVA'
                    CHECK (status IN ('ACTIVA', 'PAGADA', 'CANCELADA')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE tuition_payments (
    id                    BIGSERIAL PRIMARY KEY,
    student_tuition_id    BIGINT NOT NULL REFERENCES student_tuitions(id),
    invoice_id            BIGINT,
    payment_date          DATE NOT NULL DEFAULT CURRENT_DATE,
    amount                DECIMAL(12,2) NOT NULL,
    payment_method        VARCHAR(20) DEFAULT 'EFECTIVO',
    reference             VARCHAR(100),
    notes                 TEXT,
    created_by            VARCHAR(100),
    created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE accounts_receivable (
    id                BIGSERIAL PRIMARY KEY,
    institution_id    BIGINT NOT NULL,
    student_id        BIGINT NOT NULL,
    invoice_id        BIGINT,
    description       VARCHAR(200) NOT NULL,
    original_amount   DECIMAL(12,2) NOT NULL,
    paid_amount       DECIMAL(12,2) DEFAULT 0,
    due_date          DATE,
    status            VARCHAR(15) NOT NULL DEFAULT 'PENDIENTE'
                      CHECK (status IN ('PENDIENTE', 'PARCIAL', 'PAGADO', 'VENCIDO')),
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE credit_notes (
    id                BIGSERIAL PRIMARY KEY,
    institution_id    BIGINT NOT NULL,
    note_number       VARCHAR(30) NOT NULL,
    invoice_id        BIGINT NOT NULL REFERENCES invoices(id),
    student_id        BIGINT NOT NULL,
    note_date         DATE NOT NULL DEFAULT CURRENT_DATE,
    amount            DECIMAL(12,2) NOT NULL,
    reason            VARCHAR(100),
    observations      TEXT,
    status            VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    sri_auth_number   VARCHAR(50),
    created_by        VARCHAR(100),
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_credit_note_number UNIQUE (institution_id, note_number)
);

CREATE INDEX idx_cash_registers_institution ON cash_registers(institution_id);
CREATE INDEX idx_cash_transactions_register ON cash_transactions(register_id);
CREATE INDEX idx_cash_transactions_student ON cash_transactions(student_id);
CREATE INDEX idx_invoices_institution ON invoices(institution_id);
CREATE INDEX idx_invoices_student ON invoices(student_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);
CREATE INDEX idx_invoice_items_invoice ON invoice_items(invoice_id);
CREATE INDEX idx_tuition_plans_institution ON tuition_plans(institution_id);
CREATE INDEX idx_student_tuitions_student ON student_tuitions(student_id);
CREATE INDEX idx_student_tuitions_period ON student_tuitions(period_id);
CREATE INDEX idx_tuition_payments_tuition ON tuition_payments(student_tuition_id);
CREATE INDEX idx_accounts_receivable_institution ON accounts_receivable(institution_id);
CREATE INDEX idx_accounts_receivable_student ON accounts_receivable(student_id);
CREATE INDEX idx_accounts_receivable_status ON accounts_receivable(status);
CREATE INDEX idx_credit_notes_institution ON credit_notes(institution_id);
CREATE INDEX idx_credit_notes_invoice ON credit_notes(invoice_id);

-- ============================================================================
-- V26: INVENTARIO Y BIENES
-- ============================================================================

CREATE TABLE asset_categories (
    id                BIGSERIAL PRIMARY KEY,
    institution_id    BIGINT NOT NULL,
    name              VARCHAR(150) NOT NULL,
    description       TEXT,
    depreciation_rate DECIMAL(5,2) DEFAULT 0,
    useful_life_years INT,
    active            BOOLEAN DEFAULT TRUE,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE assets (
    id                BIGSERIAL PRIMARY KEY,
    institution_id    BIGINT NOT NULL,
    category_id       BIGINT NOT NULL REFERENCES asset_categories(id),
    code              VARCHAR(30) NOT NULL,
    name              VARCHAR(200) NOT NULL,
    description       TEXT,
    serial_number     VARCHAR(100),
    brand             VARCHAR(100),
    model             VARCHAR(100),
    purchase_date     DATE,
    purchase_cost     DECIMAL(12,2),
    current_value     DECIMAL(12,2),
    condition_status  VARCHAR(20) NOT NULL DEFAULT 'BUENO'
                      CHECK (condition_status IN ('BUENO', 'REGULAR', 'MALO', 'BAJA')),
    status            VARCHAR(15) NOT NULL DEFAULT 'DISPONIBLE'
                      CHECK (status IN ('DISPONIBLE', 'ASIGNADO', 'MANTENIMIENTO', 'BAJA')),
    location          VARCHAR(200),
    classroom_id      BIGINT,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_asset_code UNIQUE (institution_id, code)
);

CREATE TABLE asset_assignments (
    id                BIGSERIAL PRIMARY KEY,
    asset_id          BIGINT NOT NULL REFERENCES assets(id),
    assigned_to       VARCHAR(150),
    user_id           BIGINT,
    assignment_date   DATE NOT NULL DEFAULT CURRENT_DATE,
    return_date       DATE,
    status            VARCHAR(15) NOT NULL DEFAULT 'ACTIVA'
                      CHECK (status IN ('ACTIVA', 'DEVUELTA', 'CANCELADA')),
    notes             TEXT,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE asset_maintenances (
    id                BIGSERIAL PRIMARY KEY,
    asset_id          BIGINT NOT NULL REFERENCES assets(id),
    maintenance_type  VARCHAR(20) NOT NULL
                      CHECK (maintenance_type IN ('PREVENTIVO', 'CORRECTIVO', 'ESTADO')),
    description       TEXT NOT NULL,
    cost              DECIMAL(10,2) DEFAULT 0,
    scheduled_date    DATE,
    completed_date    DATE,
    status            VARCHAR(15) NOT NULL DEFAULT 'PENDIENTE'
                      CHECK (status IN ('PENDIENTE', 'EN_PROCESO', 'COMPLETADO')),
    technician        VARCHAR(150),
    notes             TEXT,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_assets_institution ON assets(institution_id);
CREATE INDEX idx_assets_category ON assets(category_id);
CREATE INDEX idx_assets_status ON assets(status);
CREATE INDEX idx_asset_assignments_asset ON asset_assignments(asset_id);
CREATE INDEX idx_asset_maintenances_asset ON asset_maintenances(asset_id);
CREATE INDEX idx_asset_maintenances_status ON asset_maintenances(status);

-- ============================================================================
-- V27: BIBLIOTECA
-- ============================================================================

CREATE TABLE book_categories (
    id              BIGSERIAL PRIMARY KEY,
    institution_id  BIGINT NOT NULL,
    name            VARCHAR(100) NOT NULL,
    description     TEXT,
    parent_id       BIGINT REFERENCES book_categories(id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE books (
    id                BIGSERIAL PRIMARY KEY,
    institution_id    BIGINT NOT NULL,
    category_id       BIGINT REFERENCES book_categories(id),
    isbn              VARCHAR(20),
    title             VARCHAR(300) NOT NULL,
    author            VARCHAR(200),
    publisher         VARCHAR(200),
    publication_year  INT,
    edition           VARCHAR(50),
    pages             INT,
    language          VARCHAR(30) DEFAULT 'Castellano',
    description       TEXT,
    cover_url         VARCHAR(500),
    total_copies      INT NOT NULL DEFAULT 1,
    available_copies  INT NOT NULL DEFAULT 1,
    location          VARCHAR(100),
    status            VARCHAR(15) NOT NULL DEFAULT 'ACTIVO'
                      CHECK (status IN ('ACTIVO', 'INACTIVO', 'PERDIDO')),
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE book_loans (
    id              BIGSERIAL PRIMARY KEY,
    book_id         BIGINT NOT NULL REFERENCES books(id),
    student_id      BIGINT,
    user_id         BIGINT,
    loan_date       DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date        DATE NOT NULL,
    return_date     DATE,
    status          VARCHAR(15) NOT NULL DEFAULT 'ACTIVO'
                    CHECK (status IN ('ACTIVO', 'DEVUELTO', 'VENCIDO', 'PERDIDO')),
    notes           TEXT,
    created_by      VARCHAR(100),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE book_reservations (
    id                BIGSERIAL PRIMARY KEY,
    book_id           BIGINT NOT NULL REFERENCES books(id),
    student_id        BIGINT,
    user_id           BIGINT,
    reservation_date  DATE NOT NULL DEFAULT CURRENT_DATE,
    expiry_date       DATE NOT NULL,
    status            VARCHAR(15) NOT NULL DEFAULT 'PENDIENTE'
                      CHECK (status IN ('PENDIENTE', 'COMPLETADA', 'CANCELADA', 'VENCIDA')),
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_books_institution ON books(institution_id);
CREATE INDEX idx_books_category ON books(category_id);
CREATE INDEX idx_books_title ON books(title);
CREATE INDEX idx_book_loans_book ON book_loans(book_id);
CREATE INDEX idx_book_loans_student ON book_loans(student_id);
CREATE INDEX idx_book_loans_status ON book_loans(status);
CREATE INDEX idx_book_reservations_book ON book_reservations(book_id);

-- ============================================================================
-- V28: BUSINESS INTELLIGENCE - VISTAS MATERIALIZADAS
-- ============================================================================

CREATE MATERIALIZED VIEW IF NOT EXISTS v_dashboard_courses AS
SELECT
    c.id AS course_id, c.name AS course_name, p.id AS period_id, p.name AS period_name,
    COUNT(DISTINCT e.student_id) AS enrolled_students,
    ROUND(AVG(pg.score), 2) AS average_score,
    COUNT(CASE WHEN pg.score < 7 THEN 1 END) AS failing_count,
    COUNT(CASE WHEN pg.score >= 7 THEN 1 END) AS passing_count
FROM courses c
LEFT JOIN enrollments e ON e.course_id = c.id AND e.status = 'ACTIVA'
LEFT JOIN period_grades pg ON pg.course_id = c.id
LEFT JOIN periods p ON p.id = pg.period_id
GROUP BY c.id, c.name, p.id, p.name;

CREATE MATERIALIZED VIEW IF NOT EXISTS v_dashboard_enrollments AS
SELECT p.id AS period_id, p.name AS period_name, COUNT(*) AS total_enrollments,
    COUNT(CASE WHEN e.status = 'ACTIVA' THEN 1 END) AS active_enrollments,
    COUNT(CASE WHEN e.status = 'RETIRADO' THEN 1 END) AS withdrawn
FROM enrollments e JOIN periods p ON p.id = e.period_id GROUP BY p.id, p.name;

CREATE MATERIALIZED VIEW IF NOT EXISTS v_dashboard_finance AS
SELECT institution_id, DATE_TRUNC('month', invoice_date) AS month, COUNT(*) AS total_invoices,
    SUM(total) AS total_billed, SUM(paid_amount) AS total_collected,
    SUM(total - paid_amount) AS total_pending
FROM invoices GROUP BY institution_id, DATE_TRUNC('month', invoice_date);

CREATE MATERIALIZED VIEW IF NOT EXISTS v_dashboard_assets AS
SELECT ac.name AS category_name, COUNT(*) AS total_assets,
    COUNT(CASE WHEN a.status = 'DISPONIBLE' THEN 1 END) AS available,
    COUNT(CASE WHEN a.status = 'ASIGNADO' THEN 1 END) AS assigned,
    COUNT(CASE WHEN a.status = 'MANTENIMIENTO' THEN 1 END) AS in_maintenance,
    SUM(a.current_value) AS total_value
FROM assets a JOIN asset_categories ac ON ac.id = a.category_id GROUP BY ac.name;

CREATE MATERIALIZED VIEW IF NOT EXISTS v_dashboard_library AS
SELECT COUNT(*) AS total_books, SUM(total_copies) AS total_copies,
    SUM(available_copies) AS available_copies,
    (SELECT COUNT(*) FROM book_loans WHERE status = 'ACTIVO') AS active_loans,
    (SELECT COUNT(*) FROM book_reservations WHERE status = 'PENDIENTE') AS pending_reservations
FROM books WHERE status = 'ACTIVO';

-- ============================================================================
-- V29: COMUNICACION
-- ============================================================================

CREATE TABLE notification_templates (
    id              BIGSERIAL PRIMARY KEY,
    institution_id  BIGINT NOT NULL,
    name            VARCHAR(100) NOT NULL,
    subject         VARCHAR(200) NOT NULL,
    body_template   TEXT NOT NULL,
    channel         VARCHAR(20) NOT NULL DEFAULT 'IN_APP'
                    CHECK (channel IN ('IN_APP', 'EMAIL', 'SMS', 'PUSH')),
    event_type      VARCHAR(50),
    active          BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE notifications (
    id                BIGSERIAL PRIMARY KEY,
    institution_id    BIGINT NOT NULL,
    template_id       BIGINT REFERENCES notification_templates(id),
    user_id           BIGINT,
    student_id        BIGINT,
    title             VARCHAR(200) NOT NULL,
    message           TEXT NOT NULL,
    channel           VARCHAR(20) NOT NULL DEFAULT 'IN_APP',
    priority          VARCHAR(10) NOT NULL DEFAULT 'NORMAL'
                      CHECK (priority IN ('BAJA', 'NORMAL', 'ALTA', 'URGENTE')),
    read_status       BOOLEAN DEFAULT FALSE,
    read_at           TIMESTAMPTZ,
    sent_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE internal_messages (
    id                BIGSERIAL PRIMARY KEY,
    institution_id    BIGINT NOT NULL,
    sender_id         BIGINT NOT NULL,
    subject           VARCHAR(200) NOT NULL,
    body              TEXT NOT NULL,
    priority          VARCHAR(10) NOT NULL DEFAULT 'NORMAL'
                      CHECK (priority IN ('BAJA', 'NORMAL', 'ALTA')),
    read_status       BOOLEAN DEFAULT FALSE,
    read_at           TIMESTAMPTZ,
    parent_message_id BIGINT REFERENCES internal_messages(id),
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE message_recipients (
    id              BIGSERIAL PRIMARY KEY,
    message_id      BIGINT NOT NULL REFERENCES internal_messages(id) ON DELETE CASCADE,
    user_id         BIGINT NOT NULL,
    read_status     BOOLEAN DEFAULT FALSE,
    read_at         TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_message_recipient UNIQUE (message_id, user_id)
);

CREATE TABLE parent_communications (
    id                BIGSERIAL PRIMARY KEY,
    institution_id    BIGINT NOT NULL,
    student_id        BIGINT NOT NULL,
    representative_id BIGINT,
    user_id           BIGINT,
    communication_type VARCHAR(30) NOT NULL
                       CHECK (communication_type IN ('ACADEMICO', 'CONDUCTA', 'SALUD', 'FINANCIERO', 'GENERAL')),
    subject           VARCHAR(200) NOT NULL,
    message           TEXT NOT NULL,
    channel           VARCHAR(20) NOT NULL DEFAULT 'IN_APP',
    status            VARCHAR(15) NOT NULL DEFAULT 'ENVIADO'
                      CHECK (status IN ('ENVIADO', 'LEIDO', 'RESPONDIDO')),
    response          TEXT,
    responded_at      TIMESTAMPTZ,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE communication_groups (
    id              BIGSERIAL PRIMARY KEY,
    institution_id  BIGINT NOT NULL,
    name            VARCHAR(100) NOT NULL,
    description     TEXT,
    group_type      VARCHAR(20) NOT NULL DEFAULT 'PERSONALIZADO'
                    CHECK (group_type IN ('CURSO', 'PARALELO', 'DOCENTES', 'PADRES', 'PERSONALIZADO')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE communication_group_members (
    id              BIGSERIAL PRIMARY KEY,
    group_id        BIGINT NOT NULL REFERENCES communication_groups(id) ON DELETE CASCADE,
    user_id         BIGINT NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_group_member UNIQUE (group_id, user_id)
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_institution ON notifications(institution_id);
CREATE INDEX idx_notifications_read ON notifications(read_status);
CREATE INDEX idx_internal_messages_sender ON internal_messages(sender_id);
CREATE INDEX idx_internal_messages_institution ON internal_messages(institution_id);
CREATE INDEX idx_message_recipients_user ON message_recipients(user_id);
CREATE INDEX idx_message_recipients_message ON message_recipients(message_id);
CREATE INDEX idx_parent_communications_student ON parent_communications(student_id);
CREATE INDEX idx_parent_communications_institution ON parent_communications(institution_id);

-- ============================================================================
-- V30: INTELIGENCIA ARTIFICIAL
-- ============================================================================

CREATE TABLE ai_models (
    id              BIGSERIAL PRIMARY KEY,
    institution_id  BIGINT NOT NULL,
    name            VARCHAR(100) NOT NULL,
    model_type      VARCHAR(30) NOT NULL
                    CHECK (model_type IN ('PREDICCION', 'RECOMENDACION', 'ANOMALIA', 'CLASIFICACION')),
    description     TEXT,
    version         VARCHAR(20) NOT NULL DEFAULT '1.0',
    config          JSONB,
    status          VARCHAR(15) NOT NULL DEFAULT 'ACTIVO'
                    CHECK (status IN ('ACTIVO', 'INACTIVO', 'ENTRENANDO')),
    last_trained_at TIMESTAMPTZ,
    accuracy        DECIMAL(5,4),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE ai_predictions (
    id              BIGSERIAL PRIMARY KEY,
    model_id        BIGINT NOT NULL REFERENCES ai_models(id),
    student_id      BIGINT NOT NULL,
    period_id       BIGINT,
    prediction_type VARCHAR(30) NOT NULL,
    predicted_value VARCHAR(100) NOT NULL,
    confidence      DECIMAL(5,4) NOT NULL,
    input_data      JSONB,
    explanation     TEXT,
    status          VARCHAR(15) NOT NULL DEFAULT 'VIGENTE'
                    CHECK (status IN ('VIGENTE', 'CONFIRMADA', 'RECHAZADA', 'VENCIDA')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE ai_recommendations (
    id              BIGSERIAL PRIMARY KEY,
    model_id        BIGINT REFERENCES ai_models(id),
    institution_id  BIGINT NOT NULL,
    target_type     VARCHAR(20) NOT NULL CHECK (target_type IN ('ESTUDIANTE', 'DOCENTE', 'CURSO', 'INSTITUCION')),
    target_id       BIGINT,
    category        VARCHAR(30) NOT NULL,
    title           VARCHAR(200) NOT NULL,
    description     TEXT NOT NULL,
    priority        VARCHAR(10) NOT NULL DEFAULT 'NORMAL'
                    CHECK (priority IN ('BAJA', 'NORMAL', 'ALTA', 'URGENTE')),
    status          VARCHAR(15) NOT NULL DEFAULT 'PENDIENTE'
                    CHECK (status IN ('PENDIENTE', 'ACEPTADA', 'RECHAZADA', 'APLICADA')),
    applied_at      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE ai_anomalies (
    id              BIGSERIAL PRIMARY KEY,
    model_id        BIGINT REFERENCES ai_models(id),
    institution_id  BIGINT NOT NULL,
    anomaly_type    VARCHAR(30) NOT NULL,
    entity_type     VARCHAR(20) NOT NULL,
    entity_id       BIGINT NOT NULL,
    description     TEXT NOT NULL,
    severity        VARCHAR(10) NOT NULL DEFAULT 'MEDIA'
                    CHECK (severity IN ('BAJA', 'MEDIA', 'ALTA', 'CRITICA')),
    detected_value  VARCHAR(200),
    expected_range  VARCHAR(200),
    status          VARCHAR(15) NOT NULL DEFAULT 'DETECTADA'
                    CHECK (status IN ('DETECTADA', 'INVESTIGANDO', 'RESUELTA', 'FALSO_POSITIVO')),
    resolved_at     TIMESTAMPTZ,
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE ai_student_profiles (
    id              BIGSERIAL PRIMARY KEY,
    student_id      BIGINT NOT NULL,
    institution_id  BIGINT NOT NULL,
    academic_risk   DECIMAL(5,4) DEFAULT 0,
    attendance_risk DECIMAL(5,4) DEFAULT 0,
    behavior_score  DECIMAL(5,4) DEFAULT 0,
    engagement_score DECIMAL(5,4) DEFAULT 0,
    learning_style  VARCHAR(30),
    strengths       TEXT,
    weaknesses      TEXT,
    recommendations TEXT,
    last_analyzed   TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_student_profile UNIQUE (student_id, institution_id)
);

CREATE INDEX idx_ai_predictions_model ON ai_predictions(model_id);
CREATE INDEX idx_ai_predictions_student ON ai_predictions(student_id);
CREATE INDEX idx_ai_predictions_status ON ai_predictions(status);
CREATE INDEX idx_ai_recommendations_institution ON ai_recommendations(institution_id);
CREATE INDEX idx_ai_recommendations_target ON ai_recommendations(target_type, target_id);
CREATE INDEX idx_ai_recommendations_status ON ai_recommendations(status);
CREATE INDEX idx_ai_anomalies_institution ON ai_anomalies(institution_id);
CREATE INDEX idx_ai_anomalies_entity ON ai_anomalies(entity_type, entity_id);
CREATE INDEX idx_ai_anomalies_status ON ai_anomalies(status);
CREATE INDEX idx_ai_anomalies_severity ON ai_anomalies(severity);
CREATE INDEX idx_ai_student_profiles_student ON ai_student_profiles(student_id);

-- ============================================================================
-- V32: PAYROLL
-- ============================================================================

CREATE TABLE payrolls (
    id                BIGSERIAL PRIMARY KEY,
    institution_id    BIGINT NOT NULL,
    period            VARCHAR(30) NOT NULL,
    period_start      DATE NOT NULL,
    period_end        DATE NOT NULL,
    total_gross       DECIMAL(12,2) DEFAULT 0,
    total_deductions  DECIMAL(12,2) DEFAULT 0,
    total_net         DECIMAL(12,2) DEFAULT 0,
    status            VARCHAR(20) NOT NULL DEFAULT 'BORRADOR',
    notes             VARCHAR(200),
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE payroll_entries (
    id                BIGSERIAL PRIMARY KEY,
    payroll_id        BIGINT NOT NULL REFERENCES payrolls(id),
    employee_id       BIGINT NOT NULL,
    base_salary       DECIMAL(12,2),
    overtime_hours    DECIMAL(5,2) DEFAULT 0,
    overtime_amount   DECIMAL(12,2) DEFAULT 0,
    bonus_amount      DECIMAL(12,2) DEFAULT 0,
    gross_salary      DECIMAL(12,2),
    iess_deduction    DECIMAL(12,2) DEFAULT 0,
    loan_deduction    DECIMAL(12,2) DEFAULT 0,
    other_deductions  DECIMAL(12,2) DEFAULT 0,
    total_deductions  DECIMAL(12,2),
    net_salary        DECIMAL(12,2),
    notes             VARCHAR(200),
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payrolls_institution ON payrolls(institution_id);
CREATE INDEX idx_payrolls_status ON payrolls(status);
CREATE INDEX idx_payroll_entries_payroll ON payroll_entries(payroll_id);
CREATE INDEX idx_payroll_entries_employee ON payroll_entries(employee_id);

-- ============================================================================
-- V33: FERIADOS
-- ============================================================================

CREATE TABLE IF NOT EXISTS holidays (
    id              BIGSERIAL PRIMARY KEY,
    institution_id  BIGINT NOT NULL REFERENCES institutions(id),
    name            VARCHAR(150) NOT NULL,
    holiday_date    DATE NOT NULL,
    category        VARCHAR(30) NOT NULL DEFAULT 'NACIONAL',
    description     TEXT,
    active          BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_holidays_institution ON holidays(institution_id);
CREATE INDEX idx_holidays_date ON holidays(holiday_date);
