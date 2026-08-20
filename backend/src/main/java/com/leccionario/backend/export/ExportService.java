package com.leccionario.backend.export;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.io.ByteArrayOutputStream;
import java.io.OutputStreamWriter;
import java.io.PrintWriter;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

@Service
@Transactional
public class ExportService {

    private final JdbcTemplate jdbc;

    public ExportService(JdbcTemplate jdbc) { this.jdbc = jdbc; }

    public byte[] exportToCsv(String query, Object... params) {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try (PrintWriter writer = new PrintWriter(new OutputStreamWriter(baos, StandardCharsets.UTF_8))) {
            List<Map<String, Object>> rows = jdbc.queryForList(query, params);
            if (rows.isEmpty()) return new byte[0];

            Map<String, Object> firstRow = rows.get(0);
            String[] headers = firstRow.keySet().toArray(new String[0]);
            writer.println(String.join(",", headers));

            for (Map<String, Object> row : rows) {
                StringBuilder sb = new StringBuilder();
                for (int i = 0; i < headers.length; i++) {
                    Object val = row.get(headers[i]);
                    String cell = val != null ? escapeCsvCell(val.toString()) : "";
                    if (i > 0) sb.append(",");
                    sb.append(cell);
                }
                writer.println(sb.toString());
            }
            writer.flush();
        } catch (Exception e) {
            throw new RuntimeException("Error exporting CSV", e);
        }
        return baos.toByteArray();
    }

    private String escapeCsvCell(String value) {
        if (value == null) return "";
        String cleaned = value.replace("\r\n", " ").replace("\n", " ").replace("\r", " ");
        if (cleaned.contains(",") || cleaned.contains("\"") || cleaned.contains("\n")) {
            return "\"" + cleaned.replace("\"", "\"\"") + "\"";
        }
        return cleaned;
    }

    public byte[] exportStudentsCsv(Long institutionId) {
        return exportToCsv(
            "SELECT s.id, u.first_name, u.last_name, s.enrollment_number, s.status " +
            "FROM students s JOIN users u ON s.user_id = u.id " +
            "WHERE s.institution_id = ? ORDER BY u.last_name",
            institutionId);
    }

    public byte[] exportEmployeesCsv(Long institutionId) {
        return exportToCsv(
            "SELECT e.id, u.first_name, u.last_name, e.position, e.department, e.status " +
            "FROM employees e JOIN users u ON e.user_id = u.id " +
            "WHERE e.institution_id = ? ORDER BY u.last_name",
            institutionId);
    }

    public byte[] exportInvoicesCsv(Long institutionId) {
        return exportToCsv(
            "SELECT invoice_number, student_id, concept, invoice_date, due_date, total, paid_amount, status " +
            "FROM invoices WHERE institution_id = ? ORDER BY invoice_date DESC",
            institutionId);
    }

    public byte[] exportAssetsCsv(Long institutionId) {
        return exportToCsv(
            "SELECT code, name, brand, model, purchase_date, purchase_cost, current_value, status, location " +
            "FROM assets WHERE institution_id = ? ORDER BY code",
            institutionId);
    }

    public byte[] exportBooksCsv(Long institutionId) {
        return exportToCsv(
            "SELECT title, author, isbn, publisher, total_copies, available_copies " +
            "FROM books WHERE institution_id = ? ORDER BY title",
            institutionId);
    }

    public byte[] exportPayrollCsv(Long institutionId) {
        return exportToCsv(
            "SELECT pe.id, e.id as employee_id, u.first_name, u.last_name, pe.period_start, pe.period_end, pe.gross_salary, pe.net_salary, pe.status " +
            "FROM payroll_entries pe " +
            "JOIN employees e ON pe.employee_id = e.id " +
            "JOIN users u ON e.user_id = u.id " +
            "WHERE e.institution_id = ? ORDER BY pe.period_start DESC",
            institutionId);
    }
}
