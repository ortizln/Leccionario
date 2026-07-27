-- ============================================================================
-- V25: GESTION FINANCIERA - Caja, Facturacion, Pensiones, Cuentas, NC
-- ============================================================================

-- ============================================================================
-- CAJA (Daily cashier operations)
-- ============================================================================

CREATE TABLE cash_registers (
    id                  BIGSERIAL PRIMARY KEY,
    institution_id      BIGINT NOT NULL REFERENCES institutions(id),
    register_date       DATE NOT NULL DEFAULT CURRENT_DATE,
    opening_balance     DECIMAL(12,2) NOT NULL DEFAULT 0,
    closing_balance     DECIMAL(12,2),
    total_income        DECIMAL(12,2) DEFAULT 0,
    total_expenses      DECIMAL(12,2) DEFAULT 0,
    status              VARCHAR(15) NOT NULL DEFAULT 'ABIERTA'
                        CHECK (status IN ('ABIERTA', 'CERRADA')),
    opened_by           VARCHAR(100),
    closed_by           VARCHAR(100),
    opened_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    closed_at           TIMESTAMPTZ,
    notes               TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_cash_register_date_inst UNIQUE (institution_id, register_date)
);

CREATE TABLE cash_transactions (
    id                  BIGSERIAL PRIMARY KEY,
    register_id         BIGINT NOT NULL REFERENCES cash_registers(id),
    transaction_type    VARCHAR(10) NOT NULL
                        CHECK (transaction_type IN ('INGRESO', 'EGRESO')),
    category            VARCHAR(50),
    description         TEXT NOT NULL,
    amount              DECIMAL(12,2) NOT NULL,
    payment_method      VARCHAR(20) DEFAULT 'EFECTIVO'
                        CHECK (payment_method IN ('EFECTIVO', 'TARJETA', 'TRANSFERENCIA', 'DEPOSITO', 'OTRO')),
    reference_number    VARCHAR(50),
    student_id          BIGINT REFERENCES students(id),
    invoice_id          BIGINT,
    created_by          VARCHAR(100),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_cash_registers_institution ON cash_registers(institution_id);
CREATE INDEX idx_cash_transactions_register ON cash_transactions(register_id);
CREATE INDEX idx_cash_transactions_type ON cash_transactions(transaction_type);
CREATE INDEX idx_cash_transactions_student ON cash_transactions(student_id);

-- ============================================================================
-- FACTURACION (Invoices)
-- ============================================================================

CREATE TABLE invoices (
    id                  BIGSERIAL PRIMARY KEY,
    institution_id      BIGINT NOT NULL REFERENCES institutions(id),
    invoice_number      VARCHAR(30) NOT NULL,
    student_id          BIGINT NOT NULL REFERENCES students(id),
    period_id           BIGINT REFERENCES periods(id),
    invoice_date        DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date            DATE,
    subtotal            DECIMAL(12,2) NOT NULL DEFAULT 0,
    iva_percent         DECIMAL(5,2) DEFAULT 12.00,
    iva_amount          DECIMAL(12,2) DEFAULT 0,
    total               DECIMAL(12,2) NOT NULL DEFAULT 0,
    paid_amount         DECIMAL(12,2) DEFAULT 0,
    balance             DECIMAL(12,2) GENERATED ALWAYS AS (total - paid_amount) STORED,
    status              VARCHAR(15) NOT NULL DEFAULT 'PENDIENTE'
                        CHECK (status IN ('PENDIENTE', 'PARCIAL', 'PAGADA', 'ANULADA', 'VENCIDA')),
    concept             VARCHAR(200),
    observations        TEXT,
    sri_auth_number     VARCHAR(50),
    sri_clave_acceso    VARCHAR(50),
    created_by          VARCHAR(100),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_invoice_number UNIQUE (invoice_number)
);

CREATE TABLE invoice_items (
    id                  BIGSERIAL PRIMARY KEY,
    invoice_id          BIGINT NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    description         VARCHAR(300) NOT NULL,
    quantity            DECIMAL(8,2) NOT NULL DEFAULT 1,
    unit_price          DECIMAL(10,2) NOT NULL,
    subtotal            DECIMAL(12,2) NOT NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_invoices_institution ON invoices(institution_id);
CREATE INDEX idx_invoices_student ON invoices(student_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_date ON invoices(invoice_date);
CREATE INDEX idx_invoice_items_invoice ON invoice_items(invoice_id);

-- ============================================================================
-- PENSIONES (Tuition/Fee Plans)
-- ============================================================================

CREATE TABLE tuition_plans (
    id                  BIGSERIAL PRIMARY KEY,
    institution_id      BIGINT NOT NULL REFERENCES institutions(id),
    name                VARCHAR(150) NOT NULL,
    description         TEXT,
    amount              DECIMAL(10,2) NOT NULL,
    iva_included        BOOLEAN DEFAULT TRUE,
    category            VARCHAR(50),
    active              BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE tuition_plan_items (
    id                  BIGSERIAL PRIMARY KEY,
    plan_id             BIGINT NOT NULL REFERENCES tuition_plans(id) ON DELETE CASCADE,
    month_number        INT NOT NULL,
    description         VARCHAR(200) NOT NULL,
    amount              DECIMAL(10,2) NOT NULL,
    due_day             INT DEFAULT 15,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE student_tuitions (
    id                  BIGSERIAL PRIMARY KEY,
    student_id          BIGINT NOT NULL REFERENCES students(id),
    plan_id             BIGINT NOT NULL REFERENCES tuition_plans(id),
    period_id           BIGINT NOT NULL REFERENCES periods(id),
    enrollment_id       BIGINT REFERENCES enrollments(id),
    total_amount        DECIMAL(12,2) NOT NULL,
    paid_amount         DECIMAL(12,2) DEFAULT 0,
    balance             DECIMAL(12,2) GENERATED ALWAYS AS (total_amount - paid_amount) STORED,
    status              VARCHAR(15) NOT NULL DEFAULT 'ACTIVA'
                        CHECK (status IN ('ACTIVA', 'COMPLETA', 'CANCELADA')),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_student_tuition UNIQUE (student_id, plan_id, period_id)
);

CREATE TABLE tuition_payments (
    id                  BIGSERIAL PRIMARY KEY,
    student_tuition_id  BIGINT NOT NULL REFERENCES student_tuitions(id),
    invoice_id          BIGINT REFERENCES invoices(id),
    payment_date        DATE NOT NULL DEFAULT CURRENT_DATE,
    amount              DECIMAL(12,2) NOT NULL,
    payment_method      VARCHAR(20) DEFAULT 'EFECTIVO',
    reference           VARCHAR(100),
    notes               TEXT,
    created_by          VARCHAR(100),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tuition_plans_institution ON tuition_plans(institution_id);
CREATE INDEX idx_student_tuitions_student ON student_tuitions(student_id);
CREATE INDEX idx_student_tuitions_period ON student_tuitions(period_id);
CREATE INDEX idx_tuition_payments_tuition ON tuition_payments(student_tuition_id);

-- ============================================================================
-- CUENTAS POR COBRAR (Accounts Receivable)
-- ============================================================================

CREATE TABLE accounts_receivable (
    id                  BIGSERIAL PRIMARY KEY,
    institution_id      BIGINT NOT NULL REFERENCES institutions(id),
    student_id          BIGINT NOT NULL REFERENCES students(id),
    invoice_id          BIGINT REFERENCES invoices(id),
    description         VARCHAR(200) NOT NULL,
    original_amount     DECIMAL(12,2) NOT NULL,
    paid_amount         DECIMAL(12,2) DEFAULT 0,
    balance             DECIMAL(12,2) GENERATED ALWAYS AS (original_amount - paid_amount) STORED,
    due_date            DATE,
    status              VARCHAR(15) NOT NULL DEFAULT 'PENDIENTE'
                        CHECK (status IN ('PENDIENTE', 'PARCIAL', 'PAGADA', 'VENCIDA', 'CASTIGADA')),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_accounts_receivable_institution ON accounts_receivable(institution_id);
CREATE INDEX idx_accounts_receivable_student ON accounts_receivable(student_id);
CREATE INDEX idx_accounts_receivable_status ON accounts_receivable(status);
CREATE INDEX idx_accounts_receivable_due ON accounts_receivable(due_date);

-- ============================================================================
-- NOTAS DE CREDITO (Credit Notes)
-- ============================================================================

CREATE TABLE credit_notes (
    id                  BIGSERIAL PRIMARY KEY,
    institution_id      BIGINT NOT NULL REFERENCES institutions(id),
    credit_note_number  VARCHAR(30) NOT NULL,
    invoice_id          BIGINT NOT NULL REFERENCES invoices(id),
    student_id          BIGINT NOT NULL REFERENCES students(id),
    credit_date         DATE NOT NULL DEFAULT CURRENT_DATE,
    amount              DECIMAL(12,2) NOT NULL,
    reason              TEXT NOT NULL,
    status              VARCHAR(15) NOT NULL DEFAULT 'EMITIDA'
                        CHECK (status IN ('EMITIDA', 'APLICADA', 'ANULADA')),
    applied_to_invoice  BIGINT,
    created_by          VARCHAR(100),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_credit_note_number UNIQUE (credit_note_number)
);

CREATE INDEX idx_credit_notes_institution ON credit_notes(institution_id);
CREATE INDEX idx_credit_notes_invoice ON credit_notes(invoice_id);
CREATE INDEX idx_credit_notes_student ON credit_notes(student_id);
CREATE INDEX idx_credit_notes_status ON credit_notes(status);
