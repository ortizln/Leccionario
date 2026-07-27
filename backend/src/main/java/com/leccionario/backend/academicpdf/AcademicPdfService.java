package com.leccionario.backend.academicpdf;

import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.util.List;
import java.util.Map;

@Service
public class AcademicPdfService {

    private final JdbcTemplate jdbc;

    private static final Color OLIVE = new Color(59, 68, 54);
    private static final Color ORANGE = new Color(224, 122, 95);

    public AcademicPdfService(JdbcTemplate jdbc) { this.jdbc = jdbc; }

    public byte[] generateCertificatePdf(Long certificateId) {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Document doc = new Document(PageSize.A4, 50, 50, 60, 60);
        try {
            PdfWriter.getInstance(doc, baos);
            doc.open();

            Map<String, Object> cert = jdbc.queryForMap(
                "SELECT c.*, ct.name as template_name, ct.template_type, ct.header_text, ct.footer_text " +
                "FROM certificates c JOIN certificate_templates ct ON c.template_id = ct.id WHERE c.id = ?", certificateId);

            Paragraph institution = new Paragraph("INSTITUCION EDUCATIVA", new Font(Font.HELVETICA, 18, Font.BOLD, OLIVE));
            institution.setAlignment(Element.ALIGN_CENTER);
            doc.add(institution);

            Paragraph subtitle = new Paragraph("Leccionario Estudiantil Digital", new Font(Font.HELVETICA, 10, Font.ITALIC, Color.GRAY));
            subtitle.setAlignment(Element.ALIGN_CENTER);
            doc.add(subtitle);
            doc.add(new Paragraph(" "));

            Paragraph title = new Paragraph(str(cert, "template_name"), new Font(Font.HELVETICA, 22, Font.BOLD, OLIVE));
            title.setAlignment(Element.ALIGN_CENTER);
            doc.add(title);

            Paragraph certNumber = new Paragraph("No. " + str(cert, "certificate_number"), new Font(Font.HELVETICA, 12, Font.NORMAL, ORANGE));
            certNumber.setAlignment(Element.ALIGN_CENTER);
            doc.add(certNumber);
            doc.add(new Paragraph(" "));

            String headerText = str(cert, "header_text");
            if (!headerText.isEmpty()) {
                doc.add(new Paragraph(headerText, new Font(Font.HELVETICA, 11)));
                doc.add(new Paragraph(" "));
            }

            PdfPTable infoTable = new PdfPTable(2);
            infoTable.setWidthPercentage(100);
            infoTable.setWidths(new float[]{3f, 5f});
            addInfoRow(infoTable, "Estudiante:", str(cert, "student_name"));
            addInfoRow(infoTable, "Matricula:", str(cert, "enrollment_number"));
            addInfoRow(infoTable, "Curso:", str(cert, "course_name"));
            addInfoRow(infoTable, "Periodo:", str(cert, "academic_period_name"));
            if (cert.get("valid_until") != null) {
                addInfoRow(infoTable, "Valido hasta:", String.valueOf(cert.get("valid_until")));
            }
            doc.add(infoTable);
            doc.add(new Paragraph(" "));

            List<Map<String, Object>> details = jdbc.queryForList(
                "SELECT * FROM certificate_details WHERE certificate_id = ?", certificateId);
            if (!details.isEmpty()) {
                PdfPTable detailTable = new PdfPTable(4);
                detailTable.setWidthPercentage(100);
                detailTable.setWidths(new float[]{3f, 1.5f, 1.5f, 3f});
                addTableHeader(detailTable, "Materia", "Promedio", "Estado", "Observacion");
                for (Map<String, Object> d : details) {
                    addCell(detailTable, str(d, "subject_name"));
                    addCell(detailTable, str(d, "score"));
                    addCell(detailTable, "APPROVED".equals(d.get("status")) ? "Aprobado" : "Reprobado");
                    addCell(detailTable, str(d, "observation"));
                }
                doc.add(detailTable);
            }

            String observations = str(cert, "observations");
            if (!observations.isEmpty()) {
                doc.add(new Paragraph(" "));
                doc.add(new Paragraph("Observaciones:", new Font(Font.HELVETICA, 11, Font.BOLD)));
                doc.add(new Paragraph(observations, new Font(Font.HELVETICA, 10)));
            }

            String footerText = str(cert, "footer_text");
            if (!footerText.isEmpty()) {
                doc.add(new Paragraph(" "));
                Paragraph footer = new Paragraph(footerText, new Font(Font.HELVETICA, 9, Font.ITALIC, Color.GRAY));
                footer.setAlignment(Element.ALIGN_CENTER);
                doc.add(footer);
            }

            doc.add(new Paragraph(" "));
            doc.add(new Paragraph(" "));
            PdfPTable sigTable = new PdfPTable(2);
            sigTable.setWidthPercentage(100);
            PdfPCell sig1 = new PdfPCell(new Phrase("\n\n_________________________\nDirector(a)", new Font(Font.HELVETICA, 9)));
            sig1.setHorizontalAlignment(Element.ALIGN_CENTER);
            sig1.setBorder(Rectangle.NO_BORDER);
            PdfPCell sig2 = new PdfPCell(new Phrase("\n\n_________________________\nSecretario(a)", new Font(Font.HELVETICA, 9)));
            sig2.setHorizontalAlignment(Element.ALIGN_CENTER);
            sig2.setBorder(Rectangle.NO_BORDER);
            sigTable.addCell(sig1);
            sigTable.addCell(sig2);
            doc.add(sigTable);

            doc.close();
        } catch (Exception e) {
            throw new RuntimeException("Error generando certificado PDF", e);
        }
        return baos.toByteArray();
    }

    public byte[] generateReportCardPdf(Long reportCardId) {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Document doc = new Document(PageSize.A4, 40, 40, 50, 40);
        try {
            PdfWriter.getInstance(doc, baos);
            doc.open();

            Map<String, Object> rc = jdbc.queryForMap(
                "SELECT * FROM report_cards WHERE id = ?", reportCardId);

            Paragraph institution = new Paragraph("INSTITUCION EDUCATIVA", new Font(Font.HELVETICA, 18, Font.BOLD, OLIVE));
            institution.setAlignment(Element.ALIGN_CENTER);
            doc.add(institution);
            doc.add(new Paragraph(" "));

            Paragraph title = new Paragraph("LIBRETA DE CALIFICACIONES", new Font(Font.HELVETICA, 16, Font.BOLD, OLIVE));
            title.setAlignment(Element.ALIGN_CENTER);
            doc.add(title);
            doc.add(new Paragraph(" "));

            PdfPTable infoTable = new PdfPTable(2);
            infoTable.setWidthPercentage(100);
            infoTable.setWidths(new float[]{3f, 5f});
            addInfoRow(infoTable, "Estudiante:", str(rc, "student_name"));
            addInfoRow(infoTable, "Matricula:", str(rc, "enrollment_number"));
            addInfoRow(infoTable, "Curso:", str(rc, "course_name"));
            addInfoRow(infoTable, "Periodo:", str(rc, "academic_period_name"));
            addInfoRow(infoTable, "Promedio General:", str(rc, "overall_average"));
            String finalStatus = str(rc, "final_status");
            addInfoRow(infoTable, "Estado:", "APPROVED".equals(finalStatus) ? "APROBADO" : "REPROBADO");
            doc.add(infoTable);
            doc.add(new Paragraph(" "));

            List<Map<String, Object>> details = jdbc.queryForList(
                "SELECT rcd.*, s.name as subject_name FROM report_card_details rcd " +
                "JOIN subjects s ON rcd.subject_id = s.id WHERE rcd.report_card_id = ?", reportCardId);
            if (!details.isEmpty()) {
                PdfPTable detailTable = new PdfPTable(5);
                detailTable.setWidthPercentage(100);
                detailTable.setWidths(new float[]{3f, 2f, 1.5f, 1.5f, 4f});
                addTableHeader(detailTable, "Materia", "Docente", "Promedio", "Estado", "Observacion");
                for (Map<String, Object> d : details) {
                    addCell(detailTable, str(d, "subject_name"));
                    addCell(detailTable, str(d, "teacher_name"));
                    addCell(detailTable, str(d, "average_score"));
                    String status = str(d, "status");
                    addCell(detailTable, "APPROVED".equals(status) ? "A" : "R");
                    addCell(detailTable, str(d, "teacher_comment"));
                }
                doc.add(detailTable);
            }

            String teacherComments = str(rc, "teacher_comments");
            if (!teacherComments.isEmpty()) {
                doc.add(new Paragraph(" "));
                doc.add(new Paragraph("Comentarios del Docente:", new Font(Font.HELVETICA, 11, Font.BOLD)));
                doc.add(new Paragraph(teacherComments, new Font(Font.HELVETICA, 10)));
            }

            String conductNotes = str(rc, "conduct_notes");
            if (!conductNotes.isEmpty()) {
                doc.add(new Paragraph(" "));
                doc.add(new Paragraph("Conducta:", new Font(Font.HELVETICA, 11, Font.BOLD)));
                doc.add(new Paragraph(conductNotes, new Font(Font.HELVETICA, 10)));
            }

            String observations = str(rc, "observations");
            if (!observations.isEmpty()) {
                doc.add(new Paragraph(" "));
                doc.add(new Paragraph("Observaciones:", new Font(Font.HELVETICA, 11, Font.BOLD)));
                doc.add(new Paragraph(observations, new Font(Font.HELVETICA, 10)));
            }

            doc.add(new Paragraph(" "));
            doc.add(new Paragraph(" "));
            PdfPTable sigTable = new PdfPTable(2);
            sigTable.setWidthPercentage(100);
            PdfPCell sig1 = new PdfPCell(new Phrase("\n\n_________________________\nDocente", new Font(Font.HELVETICA, 9)));
            sig1.setHorizontalAlignment(Element.ALIGN_CENTER);
            sig1.setBorder(Rectangle.NO_BORDER);
            PdfPCell sig2 = new PdfPCell(new Phrase("\n\n_________________________\nDirector(a)", new Font(Font.HELVETICA, 9)));
            sig2.setHorizontalAlignment(Element.ALIGN_CENTER);
            sig2.setBorder(Rectangle.NO_BORDER);
            sigTable.addCell(sig1);
            sigTable.addCell(sig2);
            doc.add(sigTable);

            doc.close();
        } catch (Exception e) {
            throw new RuntimeException("Error generando libreta PDF", e);
        }
        return baos.toByteArray();
    }

    private void addInfoRow(PdfPTable table, String label, String value) {
        PdfPCell labelCell = new PdfPCell(new Phrase(label, new Font(Font.HELVETICA, 10, Font.BOLD)));
        labelCell.setBorder(Rectangle.NO_BORDER);
        labelCell.setPadding(4);
        PdfPCell valueCell = new PdfPCell(new Phrase(value, new Font(Font.HELVETICA, 10)));
        valueCell.setBorder(Rectangle.NO_BORDER);
        valueCell.setPadding(4);
        table.addCell(labelCell);
        table.addCell(valueCell);
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

    private String str(Map<String, Object> row, String key) {
        Object val = row.get(key);
        return val != null ? String.valueOf(val) : "";
    }
}
