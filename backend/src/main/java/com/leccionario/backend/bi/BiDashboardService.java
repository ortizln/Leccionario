package com.leccionario.backend.bi;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Map;

@Service
public class BiDashboardService {

    private final JdbcTemplate jdbc;

    public BiDashboardService(JdbcTemplate jdbc) { this.jdbc = jdbc; }

    public List<Map<String, Object>> courseDashboard(Long institutionId) {
        return jdbc.queryForList(
            "SELECT * FROM v_dashboard_courses WHERE course_id IN (SELECT id FROM courses WHERE institution_id = ?)",
            institutionId);
    }

    public List<Map<String, Object>> attendanceDashboard(Long institutionId) {
        return jdbc.queryForList(
            "SELECT * FROM v_dashboard_attendance WHERE course_id IN (SELECT id FROM courses WHERE institution_id = ?)",
            institutionId);
    }

    public List<Map<String, Object>> enrollmentDashboard(Long institutionId) {
        return jdbc.queryForList("SELECT * FROM v_dashboard_enrollments");
    }

    public List<Map<String, Object>> financeDashboard(Long institutionId) {
        return jdbc.queryForList("SELECT * FROM v_dashboard_finance WHERE institution_id = ?", institutionId);
    }

    public List<Map<String, Object>> assetDashboard(Long institutionId) {
        return jdbc.queryForList("SELECT * FROM v_dashboard_assets");
    }

    public Map<String, Object> libraryDashboard() {
        return jdbc.queryForMap("SELECT * FROM v_dashboard_library");
    }

    public void refreshViews() {
        jdbc.execute("REFRESH MATERIALIZED VIEW v_dashboard_courses");
        jdbc.execute("REFRESH MATERIALIZED VIEW v_dashboard_attendance");
        jdbc.execute("REFRESH MATERIALIZED VIEW v_dashboard_enrollments");
        jdbc.execute("REFRESH MATERIALIZED VIEW v_dashboard_finance");
        jdbc.execute("REFRESH MATERIALIZED VIEW v_dashboard_assets");
        jdbc.execute("REFRESH MATERIALIZED VIEW v_dashboard_library");
    }

    public Map<String, Object> getKPIs(Long institutionId) {
        Map<String, Object> kpis = new java.util.HashMap<>();
        kpis.put("totalStudents", jdbc.queryForObject("SELECT COUNT(*) FROM students WHERE institution_id = ?", Long.class, institutionId));
        kpis.put("activeEnrollments", jdbc.queryForObject("SELECT COUNT(*) FROM enrollments WHERE status = 'ACTIVA' AND institution_id = ?", Long.class, institutionId));
        kpis.put("totalTeachers", jdbc.queryForObject("SELECT COUNT(*) FROM users WHERE institution_id = ? AND 'DOCENTE' = ANY(roles)", Long.class, institutionId));
        kpis.put("attendanceRate", jdbc.queryForObject("SELECT COALESCE(CASE WHEN COUNT(*) = 0 THEN 90 ELSE (COUNT(CASE WHEN absence_type != 'INASISTENCIA' THEN 1 END) * 100 / COUNT(*)) END, 90) FROM daily_log_student_absences dls JOIN daily_logs dl ON dls.daily_log_id = dl.id WHERE dl.institution_id = ?", Long.class, institutionId));
        kpis.put("totalRevenue", jdbc.queryForObject("SELECT COALESCE(SUM(paid_amount), 0) FROM invoices WHERE institution_id = ? AND status IN ('PAGADA','PARCIAL')", java.math.BigDecimal.class, institutionId));
        kpis.put("pendingReceivable", jdbc.queryForObject("SELECT COALESCE(SUM(amount - paid_amount), 0) FROM invoices WHERE institution_id = ? AND status != 'PAGADA'", java.math.BigDecimal.class, institutionId));
        kpis.put("totalAssets", jdbc.queryForObject("SELECT COUNT(*) FROM assets WHERE institution_id = ?", Long.class, institutionId));
        kpis.put("activeLoans", jdbc.queryForObject("SELECT COUNT(*) FROM book_loans WHERE status = 'ACTIVO'", Long.class));
        return kpis;
    }

    public List<Map<String, Object>> getMonthlyTrend(Long institutionId) {
        return jdbc.queryForList(
            "SELECT DATE_TRUNC('month', created_at) as month, " +
            "COUNT(CASE WHEN status = 'PAGADA' THEN 1 END) as paid_invoices, " +
            "COALESCE(SUM(CASE WHEN status = 'PAGADA' THEN paid_amount ELSE 0 END), 0) as collected, " +
            "COALESCE(SUM(total), 0) as billed " +
            "FROM invoices WHERE institution_id = ? " +
            "GROUP BY DATE_TRUNC('month', created_at) ORDER BY month DESC LIMIT 12", institutionId);
    }

    public List<Map<String, Object>> getTeacherRanking(Long institutionId) {
        return jdbc.queryForList(
            "SELECT u.id, u.full_name, COUNT(DISTINCT c.id) as courses, " +
            "ROUND(COALESCE(AVG(pg.score), 0), 1) as avg_score " +
            "FROM users u " +
            "JOIN courses c ON c.teacher_id = u.id AND c.institution_id = ? " +
            "LEFT JOIN period_grades pg ON pg.student_id IN (SELECT student_id FROM enrollments WHERE course_id = c.id) " +
            "WHERE 'DOCENTE' = ANY(u.roles) " +
            "GROUP BY u.id, u.full_name ORDER BY avg_score DESC LIMIT 10", institutionId);
    }

    public List<Map<String, Object>> getStudentDistribution(Long institutionId) {
        return jdbc.queryForList(
            "SELECT g.name as grade_name, COUNT(e.id) as enrolled " +
            "FROM enrollments e JOIN courses c ON e.course_id = c.id " +
            "JOIN grades g ON c.grade_id = g.id " +
            "WHERE c.institution_id = ? AND e.status = 'ACTIVA' " +
            "GROUP BY g.name ORDER BY g.name", institutionId);
    }

    public Map<String, Object> getGradeDistribution(Long institutionId) {
        Map<String, Object> result = new java.util.HashMap<>();
        List<Map<String, Object>> dist = jdbc.queryForList(
            "SELECT CASE " +
            "WHEN pg.score >= 9 THEN 'Sobresaliente (9-10)' " +
            "WHEN pg.score >= 7 THEN 'Aprobado (7-8)' " +
            "WHEN pg.score >= 5 THEN 'Supletorio (5-6)' " +
            "ELSE 'Reprobado (0-4)' END as label, " +
            "COUNT(*) as count FROM period_grades pg " +
            "JOIN enrollments e ON e.student_id = pg.student_id " +
            "WHERE e.institution_id = ? GROUP BY label ORDER BY label", institutionId);
        long total = dist.stream().mapToLong(d -> ((Number) d.get("count")).longValue()).sum();
        result.put("distribution", dist);
        result.put("total", total);
        return result;
    }

    public List<Map<String, Object>> getAttendanceTrend(Long institutionId) {
        return jdbc.queryForList(
            "SELECT dl.log_date as date, " +
            "COUNT(CASE WHEN dlsa.absence_type = 'INASISTENCIA' THEN 1 END) as absences, " +
            "COUNT(CASE WHEN dlsa.absence_type = 'TARDANZA' THEN 1 END) as tardies, " +
            "COUNT(CASE WHEN dlsa.absence_type = 'JUSTIFICADO' THEN 1 END) as justified, " +
            "COUNT(*) as total " +
            "FROM daily_logs dl " +
            "JOIN daily_log_student_absences dlsa ON dlsa.daily_log_id = dl.id " +
            "WHERE dl.institution_id = ? " +
            "GROUP BY dl.log_date ORDER BY dl.log_date DESC LIMIT 30", institutionId);
    }

    public List<Map<String, Object>> getFinancialSummary(Long institutionId) {
        return jdbc.queryForList(
            "SELECT " +
            "SUM(CASE WHEN status = 'PAGADA' THEN total ELSE 0 END) as collected, " +
            "SUM(CASE WHEN status IN ('PENDIENTE','PARCIAL') THEN total - paid_amount ELSE 0 END) as pending, " +
            "SUM(CASE WHEN due_date < CURRENT_DATE AND status != 'PAGADA' THEN total - paid_amount ELSE 0 END) as overdue, " +
            "COUNT(CASE WHEN status = 'PAGADA' THEN 1 END) as paid_count, " +
            "COUNT(CASE WHEN status != 'PAGADA' THEN 1 END) as unpaid_count " +
            "FROM invoices WHERE institution_id = ?", institutionId);
    }

    public Map<String, Object> getCommunicationStats(Long institutionId) {
        Map<String, Object> result = new java.util.HashMap<>();
        result.put("totalNotifications", jdbc.queryForObject("SELECT COUNT(*) FROM notifications WHERE institution_id = ?", Long.class, institutionId));
        result.put("totalMessages", jdbc.queryForObject("SELECT COUNT(*) FROM internal_messages WHERE institution_id = ?", Long.class, institutionId));
        result.put("totalParentComms", jdbc.queryForObject("SELECT COUNT(*) FROM parent_communications WHERE institution_id = ?", Long.class, institutionId));
        result.put("activeGroups", jdbc.queryForObject("SELECT COUNT(*) FROM communication_groups WHERE institution_id = ?", Long.class, institutionId));
        return result;
    }

    public Map<String, Object> getConductaStats(Long institutionId) {
        Map<String, Object> result = new java.util.HashMap<>();
        try { result.put("merits", jdbc.queryForObject("SELECT COUNT(*) FROM student_merits WHERE institution_id = ?", Long.class, institutionId)); } catch (Exception e) { result.put("merits", 0); }
        try { result.put("demerits", jdbc.queryForObject("SELECT COUNT(*) FROM student_demerits WHERE institution_id = ?", Long.class, institutionId)); } catch (Exception e) { result.put("demerits", 0); }
        try { result.put("totalStudents", jdbc.queryForObject("SELECT COUNT(*) FROM students WHERE institution_id = ?", Long.class, institutionId)); } catch (Exception e) { result.put("totalStudents", 0); }
        return result;
    }

    public Map<String, Object> getPayrollSummary(Long institutionId) {
        Map<String, Object> result = new java.util.HashMap<>();
        try { result.put("totalPayrolls", jdbc.queryForObject("SELECT COUNT(*) FROM payrolls WHERE institution_id = ?", Long.class, institutionId)); } catch (Exception e) { result.put("totalPayrolls", 0); }
        try { result.put("totalNetPaid", jdbc.queryForObject("SELECT COALESCE(SUM(net_salary), 0) FROM payrolls WHERE institution_id = ? AND status = 'PAGADO'", java.math.BigDecimal.class, institutionId)); } catch (Exception e) { result.put("totalNetPaid", java.math.BigDecimal.ZERO); }
        try { result.put("pendingPayrolls", jdbc.queryForObject("SELECT COUNT(*) FROM payrolls WHERE institution_id = ? AND status = 'BORRADOR'", Long.class, institutionId)); } catch (Exception e) { result.put("pendingPayrolls", 0); }
        try { result.put("totalEmployees", jdbc.queryForObject("SELECT COUNT(*) FROM employees WHERE institution_id = ?", Long.class, institutionId)); } catch (Exception e) { result.put("totalEmployees", 0); }
        return result;
    }

    public Map<String, Object> getHrSummary(Long institutionId) {
        Map<String, Object> result = new java.util.HashMap<>();
        try { result.put("totalEmployees", jdbc.queryForObject("SELECT COUNT(*) FROM employees WHERE institution_id = ?", Long.class, institutionId)); } catch (Exception e) { result.put("totalEmployees", 0); }
        try { result.put("activeContracts", jdbc.queryForObject("SELECT COUNT(*) FROM employment_contracts WHERE status = 'ACTIVO'", Long.class)); } catch (Exception e) { result.put("activeContracts", 0); }
        try { result.put("pendingVacations", jdbc.queryForObject("SELECT COUNT(*) FROM staff_vacations WHERE status = 'PENDIENTE'", Long.class)); } catch (Exception e) { result.put("pendingVacations", 0); }
        try { result.put("totalTrainings", jdbc.queryForObject("SELECT COUNT(*) FROM staff_trainings WHERE institution_id = ?", Long.class, institutionId)); } catch (Exception e) { result.put("totalTrainings", 0); }
        return result;
    }
}
