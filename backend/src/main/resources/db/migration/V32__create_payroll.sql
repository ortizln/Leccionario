-- V32: Payroll tables for RRHH

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
