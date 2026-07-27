-- V34: New modules tables
-- M3: Employee Attendance
CREATE TABLE IF NOT EXISTS employee_attendances (
    id BIGSERIAL PRIMARY KEY,
    employee_id BIGINT NOT NULL REFERENCES employees(id),
    attendance_date DATE NOT NULL,
    check_in_time TIME,
    check_out_time TIME,
    status VARCHAR(20) NOT NULL DEFAULT 'PRESENTE',
    observations VARCHAR(500),
    institution_id BIGINT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_emp_att_employee ON employee_attendances(employee_id);
CREATE INDEX IF NOT EXISTS idx_emp_att_inst_date ON employee_attendances(institution_id, attendance_date);

-- M3: Employee Evaluations
CREATE TABLE IF NOT EXISTS employee_evaluations (
    id BIGSERIAL PRIMARY KEY,
    employee_id BIGINT NOT NULL REFERENCES employees(id),
    evaluation_type VARCHAR(50) NOT NULL,
    evaluation_date DATE NOT NULL,
    score DECIMAL(3,1),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE',
    strengths VARCHAR(500),
    improvements VARCHAR(500),
    comments VARCHAR(500),
    institution_id BIGINT NOT NULL,
    evaluated_by_user_id BIGINT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_emp_eval_employee ON employee_evaluations(employee_id);
CREATE INDEX IF NOT EXISTS idx_emp_eval_inst ON employee_evaluations(institution_id);

-- M5: Financial Discounts
CREATE TABLE IF NOT EXISTS financial_discounts (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(300),
    discount_type VARCHAR(30) NOT NULL,
    value DECIMAL(10,2) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVO',
    valid_from DATE,
    valid_until DATE,
    institution_id BIGINT NOT NULL,
    student_id BIGINT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_fin_disc_inst ON financial_discounts(institution_id);
CREATE INDEX IF NOT EXISTS idx_fin_disc_student ON financial_discounts(student_id);

-- M6: Suppliers
CREATE TABLE IF NOT EXISTS suppliers (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    ruc VARCHAR(20),
    contact_name VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(100),
    address VARCHAR(200),
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVO',
    institution_id BIGINT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_supplier_inst ON suppliers(institution_id);

-- M7: Library Fines
CREATE TABLE IF NOT EXISTS library_fines (
    id BIGSERIAL PRIMARY KEY,
    loan_id BIGINT NOT NULL REFERENCES book_loans(id),
    student_id BIGINT NOT NULL,
    fine_amount DECIMAL(10,2) NOT NULL,
    days_overdue INT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDIENTE',
    paid_date DATE,
    reason VARCHAR(200),
    institution_id BIGINT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_lib_fine_student ON library_fines(student_id);
CREATE INDEX IF NOT EXISTS idx_lib_fine_inst ON library_fines(institution_id);
