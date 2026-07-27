package com.leccionario.backend.search;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class SearchService {

    private final JdbcTemplate jdbc;

    public SearchService(JdbcTemplate jdbc) { this.jdbc = jdbc; }

    public List<Map<String, Object>> search(String query, Long institutionId, int limit) {
        String q = "%" + query.trim().toLowerCase() + "%";
        List<Map<String, Object>> results = new ArrayList<>();

        try {
            results.addAll(jdbc.queryForList(
                "SELECT 'Estudiantes' as type, CONCAT(first_name, ' ', last_name) as label, " +
                "enrollment_number as detail, '/app/academic/students' as route, 'bi bi-person-fill as icon' " +
                "FROM students s JOIN users u ON s.user_id = u.id " +
                "WHERE s.institution_id = ? AND (LOWER(u.full_name) LIKE ? OR LOWER(s.enrollment_number) LIKE ?) " +
                "LIMIT ?", institutionId, q, q, limit));
        } catch (Exception ignored) {}

        try {
            results.addAll(jdbc.queryForList(
                "SELECT 'Docentes' as type, full_name as label, " +
                "username as detail, '/app/academic/teachers' as route, 'bi bi-person-badge-fill as icon' " +
                "FROM users WHERE institution_id = ? AND 'DOCENTE' = ANY(roles) " +
                "AND (LOWER(full_name) LIKE ? OR LOWER(username) LIKE ?) " +
                "LIMIT ?", institutionId, q, q, limit));
        } catch (Exception ignored) {}

        try {
            results.addAll(jdbc.queryForList(
                "SELECT 'Cursos' as type, CONCAT(g.name, ' ', c.parallel) as label, " +
                "c.id::text as detail, '/app/academic/courses' as route, 'bi bi-grid-1x2-fill as icon' " +
                "FROM courses c JOIN grades g ON c.grade_id = g.id " +
                "WHERE c.institution_id = ? AND (LOWER(g.name) LIKE ? OR LOWER(c.parallel) LIKE ?) " +
                "LIMIT ?", institutionId, q, q, limit));
        } catch (Exception ignored) {}

        try {
            results.addAll(jdbc.queryForList(
                "SELECT 'Materias' as type, name as label, " +
                "code as detail, '/app/academic/subjects' as route, 'bi bi-book as icon' " +
                "FROM subjects WHERE institution_id = ? AND (LOWER(name) LIKE ? OR LOWER(code) LIKE ?) " +
                "LIMIT ?", institutionId, q, q, limit));
        } catch (Exception ignored) {}

        try {
            results.addAll(jdbc.queryForList(
                "SELECT 'Libros' as type, title as label, " +
                "isbn as detail, '/app/library' as route, 'bi bi-book-half as icon' " +
                "FROM books WHERE institution_id = ? AND (LOWER(title) LIKE ? OR LOWER(isbn) LIKE ? OR LOWER(author) LIKE ?) " +
                "LIMIT ?", institutionId, q, q, q, limit));
        } catch (Exception ignored) {}

        try {
            results.addAll(jdbc.queryForList(
                "SELECT 'Facturas' as type, invoice_number as label, " +
                "CONCAT('$', total) as detail, '/app/invoices' as route, 'bi bi-receipt as icon' " +
                "FROM invoices WHERE institution_id = ? AND (LOWER(invoice_number) LIKE ?) " +
                "LIMIT ?", institutionId, q, limit));
        } catch (Exception ignored) {}

        try {
            results.addAll(jdbc.queryForList(
                "SELECT 'Empleados' as type, CONCAT(u.first_name, ' ', u.last_name) as label, " +
                "e.position as detail, '/app/employees' as route, 'bi bi-person-badge as icon' " +
                "FROM employees e JOIN users u ON e.user_id = u.id " +
                "WHERE e.institution_id = ? AND (LOWER(u.full_name) LIKE ? OR LOWER(e.position) LIKE ?) " +
                "LIMIT ?", institutionId, q, q, limit));
        } catch (Exception ignored) {}

        return results;
    }
}
