-- ============================================================================
-- V23: RECURSOS HUMANOS - Expediente, Contratos, Vacaciones, Permisos, Capacitaciones
-- ============================================================================

-- ============================================================================
-- EMPLEADOS (Employee records)
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

-- ============================================================================
-- CONTRATOS (Employment contracts)
-- ============================================================================

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

-- ============================================================================
-- VACACIONES (Vacation periods and requests)
-- ============================================================================

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

-- ============================================================================
-- PERMISOS STAFF (Staff permissions/leaves)
-- ============================================================================

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

-- ============================================================================
-- CAPACITACIONES (Training courses and employee participation)
-- ============================================================================

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
