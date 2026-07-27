-- ============================================================================
-- V22: GESTION INSTITUCIONAL - Sedes, Jornadas, Aulas, Calendario, Config
-- ============================================================================

-- ============================================================================
-- SEDES (Campus/Sites)
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

-- ============================================================================
-- JORNADAS (Turnos/Shifts)
-- ============================================================================

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

-- ============================================================================
-- AULAS (Classrooms/Labs)
-- ============================================================================

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

-- ============================================================================
-- CALENDARIO ESCOLAR (School Calendar Events)
-- ============================================================================

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

-- ============================================================================
-- CONFIGURACION INSTITUCIONAL (Institution Settings)
-- ============================================================================

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
