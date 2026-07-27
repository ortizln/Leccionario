-- V28: Business Intelligence - vistas materializadas y reportes

-- Dashboard principal: resumen por curso
CREATE MATERIALIZED VIEW IF NOT EXISTS v_dashboard_courses AS
SELECT
    c.id AS course_id,
    c.name AS course_name,
    p.id AS period_id,
    p.name AS period_name,
    COUNT(DISTINCT e.student_id) AS enrolled_students,
    COUNT(DISTINCT pg.id) AS grades_registered,
    ROUND(AVG(pg.score), 2) AS average_score,
    COUNT(CASE WHEN pg.score < 7 THEN 1 END) AS failing_count,
    COUNT(CASE WHEN pg.score >= 7 THEN 1 END) AS passing_count
FROM courses c
LEFT JOIN enrollments e ON e.course_id = c.id AND e.status = 'ACTIVA'
LEFT JOIN period_grades pg ON pg.course_id = c.id
LEFT JOIN periods p ON p.id = pg.period_id
GROUP BY c.id, c.name, p.id, p.name;

-- Dashboard: asistencia por curso
CREATE MATERIALIZED VIEW IF NOT EXISTS v_dashboard_attendance AS
SELECT
    c.id AS course_id,
    c.name AS course_name,
    d.log_date,
    COUNT(CASE WHEN dlsa.absence_type = 'INASISTENCIA' THEN 1 END) AS absences,
    COUNT(CASE WHEN dlsa.absence_type = 'TARDANZA' THEN 1 END) AS tardies,
    COUNT(CASE WHEN dlsa.absence_type = 'JUSTIFICADO' THEN 1 END) AS justified
FROM courses c
LEFT JOIN daily_logs dl ON dl.course_id = c.id
LEFT JOIN daily_log_entries dle ON dle.daily_log_id = dl.id
LEFT JOIN daily_log_student_absences dlsa ON dlsa.entry_id = dle.id
LEFT JOIN periods p ON p.id = dl.period_id
LEFT JOIN daily_logs d ON d.id = dl.id
GROUP BY c.id, c.name, d.log_date;

-- Dashboard: matriculas por periodo
CREATE MATERIALIZED VIEW IF NOT EXISTS v_dashboard_enrollments AS
SELECT
    p.id AS period_id,
    p.name AS period_name,
    COUNT(*) AS total_enrollments,
    COUNT(CASE WHEN e.status = 'ACTIVA' THEN 1 END) AS active_enrollments,
    COUNT(CASE WHEN e.status = 'RETIRADO' THEN 1 END) AS withdrawn
FROM enrollments e
JOIN periods p ON p.id = e.period_id
GROUP BY p.id, p.name;

-- Dashboard: ingresos financieros
CREATE MATERIALIZED VIEW IF NOT EXISTS v_dashboard_finance AS
SELECT
    i.institution_id,
    DATE_TRUNC('month', i.invoice_date) AS month,
    COUNT(*) AS total_invoices,
    SUM(i.total) AS total_billed,
    SUM(i.paid_amount) AS total_collected,
    SUM(i.total - i.paid_amount) AS total_pending
FROM invoices i
GROUP BY i.institution_id, DATE_TRUNC('month', i.invoice_date);

-- Dashboard: bienes por categoria
CREATE MATERIALIZED VIEW IF NOT EXISTS v_dashboard_assets AS
SELECT
    ac.name AS category_name,
    COUNT(*) AS total_assets,
    COUNT(CASE WHEN a.status = 'DISPONIBLE' THEN 1 END) AS available,
    COUNT(CASE WHEN a.status = 'ASIGNADO' THEN 1 END) AS assigned,
    COUNT(CASE WHEN a.status = 'MANTENIMIENTO' THEN 1 END) AS in_maintenance,
    SUM(a.current_value) AS total_value
FROM assets a
JOIN asset_categories ac ON ac.id = a.category_id
GROUP BY ac.name;

-- Dashboard: biblioteca
CREATE MATERIALIZED VIEW IF NOT EXISTS v_dashboard_library AS
SELECT
    COUNT(*) AS total_books,
    SUM(total_copies) AS total_copies,
    SUM(available_copies) AS available_copies,
    (SELECT COUNT(*) FROM book_loans WHERE status = 'ACTIVO') AS active_loans,
    (SELECT COUNT(*) FROM book_reservations WHERE status = 'PENDIENTE') AS pending_reservations
FROM books
WHERE status = 'ACTIVO';
