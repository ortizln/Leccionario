-- ============================================================================
-- V24: GESTION ESTUDIANTIL - Salud, Psicologia, Seguro, Becas, Clubes, Transporte
-- ============================================================================

-- ============================================================================
-- SALUD ESTUDIANTIL (Student Health Records)
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

-- ============================================================================
-- PSICOLOGIA (Psychological Evaluations)
-- ============================================================================

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

-- ============================================================================
-- SEGURO ESTUDIANTIL (Student Insurance)
-- ============================================================================

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

-- ============================================================================
-- BECAS (Scholarships)
-- ============================================================================

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

-- ============================================================================
-- CLUBES Y DEPORTES (Clubs and Sports)
-- ============================================================================

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

-- ============================================================================
-- TRANSPORTE (Transport Routes and Assignment)
-- ============================================================================

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
