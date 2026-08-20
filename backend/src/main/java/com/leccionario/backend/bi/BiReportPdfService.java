package com.leccionario.backend.bi;

import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.util.List;
import java.util.Map;

@Service
@Transactional
public class BiReportPdfService {

    private final JdbcTemplate jdbc;

    private static final Color OLIVE = new Color(59, 68, 54);
    private static final Color SAND = new Color(244, 241, 222);
    private static final Color ORANGE = new Color(224, 122, 95);

    public BiReportPdfService(JdbcTemplate jdbc) { this.jdbc = jdbc; }

    public byte[] generateAcademicReport(Long institutionId) {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Document doc = new Document(PageSize.A4, 36, 36, 54, 36);
        try {
            PdfWriter.getInstance(doc, baos);
            doc.open();
            addHeader(doc, "Reporte Academico");
            addMetadata(doc, institutionId);

            PdfPTable table = new PdfPTable(6);
            table.setWidthPercentage(100);
            table.setWidths(new float[]{3f, 2f, 1.5f, 1.5f, 1.5f, 1.5f});
            addTableHeader(table, "Curso", "Periodo", "Estudiantes", "Promedio", "Aprobados", "Reprobados");

            List<Map<String, Object>> rows = jdbc.queryForList(
                "SELECT * FROM v_dashboard_courses WHERE course_id IN (SELECT id FROM courses WHERE institution_id = ?)",
                institutionId);
            for (Map<String, Object> row : rows) {
                addCell(table, str(row, "course_name"));
                addCell(table, str(row, "period_name"));
                addCell(table, str(row, "enrolled_students"));
                addCell(table, str(row, "average_score"));
                addCell(table, str(row, "passing_count"));
                addCell(table, str(row, "failing_count"));
            }
            doc.add(table);
            doc.close();
        } catch (Exception e) {
            throw new RuntimeException("Error generando reporte academico PDF", e);
        }
        return baos.toByteArray();
    }

    public byte[] generateFinancialReport(Long institutionId) {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Document doc = new Document(PageSize.A4, 36, 36, 54, 36);
        try {
            PdfWriter.getInstance(doc, baos);
            doc.open();
            addHeader(doc, "Reporte Financiero");

            PdfPTable table = new PdfPTable(5);
            table.setWidthPercentage(100);
            table.setWidths(new float[]{3f, 2f, 2f, 2f, 2f});
            addTableHeader(table, "Mes", "Facturas", "Facturado", "Cobrado", "Pendiente");

            List<Map<String, Object>> rows = jdbc.queryForList(
                "SELECT * FROM v_dashboard_finance WHERE institution_id = ?", institutionId);
            for (Map<String, Object> row : rows) {
                addCell(table, str(row, "month"));
                addCell(table, str(row, "total_invoices"));
                addCell(table, str(row, "total_billed"));
                addCell(table, str(row, "total_collected"));
                addCell(table, str(row, "total_pending"));
            }
            doc.add(table);

            doc.add(new Paragraph(" "));
            Paragraph sectionTitle = new Paragraph("Resumen Financiero", new Font(Font.HELVETICA, 14, Font.BOLD));
            doc.add(sectionTitle);
            PdfPTable summaryTable = new PdfPTable(5);
            summaryTable.setWidthPercentage(100);
            addTableHeader(summaryTable, "Cobrado", "Pendiente", "Vencido", "Pagadas", "Impagas");

            Map<String, Object> fin = jdbc.queryForMap(
                "SELECT " +
                "SUM(CASE WHEN status = 'PAGADA' THEN total ELSE 0 END) as collected, " +
                "SUM(CASE WHEN status IN ('PENDIENTE','PARCIAL') THEN total - paid_amount ELSE 0 END) as pending, " +
                "SUM(CASE WHEN due_date < CURRENT_DATE AND status != 'PAGADA' THEN total - paid_amount ELSE 0 END) as overdue, " +
                "COUNT(CASE WHEN status = 'PAGADA' THEN 1 END) as paid_count, " +
                "COUNT(CASE WHEN status != 'PAGADA' THEN 1 END) as unpaid_count " +
                "FROM invoices WHERE institution_id = ?", institutionId);
            addCell(summaryTable, "$" + fin.getOrDefault("collected", 0));
            addCell(summaryTable, "$" + fin.getOrDefault("pending", 0));
            addCell(summaryTable, "$" + fin.getOrDefault("overdue", 0));
            addCell(summaryTable, str(fin, "paid_count"));
            addCell(summaryTable, str(fin, "unpaid_count"));
            doc.add(summaryTable);
            doc.close();
        } catch (Exception e) {
            throw new RuntimeException("Error generando reporte financiero PDF", e);
        }
        return baos.toByteArray();
    }

    public byte[] generateEnrollmentReport(Long institutionId) {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Document doc = new Document(PageSize.A4, 36, 36, 54, 36);
        try {
            PdfWriter.getInstance(doc, baos);
            doc.open();
            addHeader(doc, "Reporte de Matriculas");

            PdfPTable table = new PdfPTable(4);
            table.setWidthPercentage(100);
            table.setWidths(new float[]{3f, 2f, 2f, 2f});
            addTableHeader(table, "Periodo", "Total", "Activas", "Retiradas");

            List<Map<String, Object>> rows = jdbc.queryForList("SELECT * FROM v_dashboard_enrollments");
            for (Map<String, Object> row : rows) {
                addCell(table, str(row, "period_name"));
                addCell(table, str(row, "total_enrollments"));
                addCell(table, str(row, "active_enrollments"));
                addCell(table, str(row, "withdrawn"));
            }
            doc.add(table);
            doc.close();
        } catch (Exception e) {
            throw new RuntimeException("Error generando reporte de matriculas PDF", e);
        }
        return baos.toByteArray();
    }

    public byte[] generateHrReport(Long institutionId) {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Document doc = new Document(PageSize.A4, 36, 36, 54, 36);
        try {
            PdfWriter.getInstance(doc, baos);
            doc.open();
            addHeader(doc, "Reporte de Recursos Humanos");

            PdfPTable table = new PdfPTable(4);
            table.setWidthPercentage(100);
            addTableHeader(table, "Metrica", "Valor", "Detalle", "Estado");
            Map<String, Object> hr = jdbc.queryForMap(
                "SELECT " +
                "(SELECT COUNT(*) FROM employees WHERE institution_id = ?) as total_employees, " +
                "(SELECT COUNT(*) FROM employment_contracts WHERE status = 'ACTIVO') as active_contracts, " +
                "(SELECT COUNT(*) FROM staff_vacations WHERE status = 'PENDIENTE') as pending_vacations, " +
                "(SELECT COUNT(*) FROM staff_trainings WHERE institution_id = ?) as total_trainings",
                institutionId, institutionId);
            addCell(table, "Empleados Totales"); addCell(table, str(hr, "total_employees")); addCell(table, "Active"); addCell(table, "OK");
            addCell(table, "Contratos Activos"); addCell(table, str(hr, "active_contracts")); addCellTable(table, "Vigentes", Color.GREEN); addCell(table, "OK");
            addCell(table, "Vacaciones Pendientes"); addCell(table, str(hr, "pending_vacations")); addCell(table, "Por revisar"); addCell(table, "Pendiente");
            addCell(table, "Capacitaciones"); addCell(table, str(hr, "total_trainings")); addCell(table, "Registradas"); addCell(table, "OK");
            doc.add(table);
            doc.close();
        } catch (Exception e) {
            throw new RuntimeException("Error generando reporte HR PDF", e);
        }
        return baos.toByteArray();
    }

    public byte[] generateLibraryReport(Long institutionId) {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Document doc = new Document(PageSize.A4, 36, 36, 54, 36);
        try {
            PdfWriter.getInstance(doc, baos);
            doc.open();
            addHeader(doc, "Reporte de Biblioteca");

            PdfPTable table = new PdfPTable(3);
            table.setWidthPercentage(100);
            addTableHeader(table, "Libros", "Prestamos Activos", "Reservas");
            Map<String, Object> lib = jdbc.queryForMap("SELECT * FROM v_dashboard_library");
            addCell(table, str(lib, "total_books"));
            addCell(table, str(lib, "active_loans"));
            addCell(table, str(lib, "total_reservations"));
            doc.add(table);
            doc.close();
        } catch (Exception e) {
            throw new RuntimeException("Error generando reporte biblioteca PDF", e);
        }
        return baos.toByteArray();
    }

    private void addHeader(Document doc, String title) throws Exception {
        Paragraph header = new Paragraph("Leccionario Estudiantil Digital", new Font(Font.HELVETICA, 18, Font.BOLD, OLIVE));
        header.setAlignment(Element.ALIGN_CENTER);
        doc.add(header);
        Paragraph sub = new Paragraph(title, new Font(Font.HELVETICA, 14, Font.NORMAL, ORANGE));
        sub.setAlignment(Element.ALIGN_CENTER);
        doc.add(sub);
        Paragraph date = new Paragraph("Fecha: " + java.time.LocalDate.now(), new Font(Font.HELVETICA, 9, Font.NORMAL, Color.GRAY));
        date.setAlignment(Element.ALIGN_RIGHT);
        doc.add(date);
        doc.add(new Paragraph(" "));
    }

    private void addMetadata(Document doc, Long institutionId) {
        try {
            Map<String, Object> inst = jdbc.queryForMap("SELECT name FROM institutions WHERE id = ?", institutionId);
            Paragraph meta = new Paragraph("Institucion: " + inst.getOrDefault("name", "N/A"), new Font(Font.HELVETICA, 10, Font.ITALIC));
            doc.add(meta);
        } catch (Exception ignored) {}
    }

    private void addTableHeader(PdfPTable table, String... headers) {
        for (String h : headers) {
            PdfPCell cell = new PdfPCell(new Phrase(h, new Font(Font.HELVETICA, 9, Font.BOLD, Color.WHITE)));
            cell.setBackgroundColor(OLIVE);
            cell.setPadding(6);
            cell.setHorizontalAlignment(Element.ALIGN_CENTER);
            table.addCell(cell);
        }
    }

    private void addCell(PdfPTable table, Object value) {
        PdfPCell cell = new PdfPCell(new Phrase(String.valueOf(value != null ? value : ""), new Font(Font.HELVETICA, 9)));
        cell.setPadding(5);
        table.addCell(cell);
    }

    private void addCellTable(PdfPTable table, String text, Color color) {
        PdfPCell cell = new PdfPCell(new Phrase(text, new Font(Font.HELVETICA, 9, Font.NORMAL, color)));
        cell.setPadding(5);
        table.addCell(cell);
    }

    private String str(Map<String, Object> row, String key) {
        Object val = row.get(key);
        return val != null ? String.valueOf(val) : "";
    }
}
