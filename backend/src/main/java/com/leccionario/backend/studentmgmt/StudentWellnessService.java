package com.leccionario.backend.studentmgmt;

import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

@Service
@Transactional
public class StudentWellnessService {

    private final PsychologicalEvaluationRepository psychRepo;
    private final StudentInsuranceRepository insuranceRepo;
    private final StudentVaccinationRepository vaccinationRepo;
    private final JdbcTemplate jdbc;

    public StudentWellnessService(PsychologicalEvaluationRepository psychRepo, StudentInsuranceRepository insuranceRepo,
                                   StudentVaccinationRepository vaccinationRepo, JdbcTemplate jdbc) {
        this.psychRepo = psychRepo;
        this.insuranceRepo = insuranceRepo;
        this.vaccinationRepo = vaccinationRepo;
        this.jdbc = jdbc;
    }

    public PsychologicalEvaluation saveEvaluation(PsychologicalEvaluation eval) { return psychRepo.save(eval); }
    public List<PsychologicalEvaluation> getEvaluations(Long studentId) { return psychRepo.findByStudentIdOrderByEvaluationDateDesc(studentId); }
    public void deleteEvaluation(Long id) { psychRepo.deleteById(id); }

    public Map<String, Object> getPsychStats() {
        long critical = psychRepo.countByRiskLevel("CRITICO");
        long high = psychRepo.countByRiskLevel("ALTO");
        long totalEvals = psychRepo.count();
        return Map.of("critical", critical, "high", high, "totalEvaluations", totalEvals);
    }

    public StudentInsurance saveInsurance(StudentInsurance ins) { return insuranceRepo.save(ins); }
    public List<StudentInsurance> getInsurance(Long studentId) { return insuranceRepo.findByStudentIdOrderByStartDateDesc(studentId); }
    public void deleteInsurance(Long id) { insuranceRepo.deleteById(id); }

    public Map<String, Object> getWellnessOverview(Long institutionId) {
        Map<String, Object> overview = new java.util.HashMap<>();
        try { overview.put("totalStudents", jdbc.queryForObject("SELECT COUNT(*) FROM students WHERE institution_id = ?", Long.class, institutionId)); } catch (Exception e) { overview.put("totalStudents", 0); }
        try { overview.put("totalEvaluations", psychRepo.count()); } catch (Exception e) { overview.put("totalEvaluations", 0); }
        try { overview.put("criticalCases", jdbc.queryForObject("SELECT COUNT(*) FROM psychological_evaluations WHERE risk_level = 'CRITICO'", Long.class)); } catch (Exception e) { overview.put("criticalCases", 0); }
        try { overview.put("activeInsurances", insuranceRepo.count()); } catch (Exception e) { overview.put("activeInsurances", 0); }
        try { overview.put("totalVaccinations", vaccinationRepo.count()); } catch (Exception e) { overview.put("totalVaccinations", 0); }
        try { overview.put("completedVaccinations", jdbc.queryForObject("SELECT COUNT(*) FROM student_vaccinations WHERE status = 'COMPLETADA'", Long.class)); } catch (Exception e) { overview.put("completedVaccinations", 0); }
        return overview;
    }

    public byte[] getPsychEvaluationPdf(Long studentId) {
        List<PsychologicalEvaluation> evals = psychRepo.findByStudentIdOrderByEvaluationDateDesc(studentId);
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("dd/MM/yyyy");

        try {
            Document document = new Document(PageSize.LETTER, 40, 40, 40, 40);
            PdfWriter.getInstance(document, baos);
            document.open();

            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16);
            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, java.awt.Color.WHITE);
            Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 10);

            Paragraph title = new Paragraph("Evaluaciones Psicologicas - Estudiante #" + studentId, titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);
            document.add(new Paragraph(" "));

            PdfPTable table = new PdfPTable(5);
            table.setWidths(new float[]{15, 20, 25, 20, 20});
            addCell(table, "Fecha", headerFont);
            addCell(table, "Tipo", headerFont);
            addCell(table, "Area", headerFont);
            addCell(table, "Riesgo", headerFont);
            addCell(table, "Evaluador", headerFont);

            for (PsychologicalEvaluation e : evals) {
                addCell(table, e.getEvaluationDate() != null ? e.getEvaluationDate().format(fmt) : "", normalFont);
                addCell(table, e.getEvaluationType() != null ? e.getEvaluationType() : "", normalFont);
                addCell(table, e.getArea() != null ? e.getArea() : "", normalFont);
                addCell(table, e.getRiskLevel() != null ? e.getRiskLevel() : "", normalFont);
                addCell(table, e.getEvaluatorName() != null ? e.getEvaluatorName() : "", normalFont);
            }
            if (evals.isEmpty()) {
                PdfPCell empty = new PdfPCell(new Paragraph("Sin evaluaciones registradas", normalFont));
                empty.setColspan(5);
                table.addCell(empty);
            }
            document.add(table);
            document.close();
        } catch (DocumentException e) {
            throw new RuntimeException("Error generating psych eval PDF", e);
        }
        return baos.toByteArray();
    }

    public byte[] getWellnessReportPdf(Long institutionId) {
        Map<String, Object> overview = getWellnessOverview(institutionId);
        ByteArrayOutputStream baos = new ByteArrayOutputStream();

        try {
            Document document = new Document(PageSize.LETTER, 40, 40, 40, 40);
            PdfWriter.getInstance(document, baos);
            document.open();

            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16);
            Font boldFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11);
            Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 10);

            Paragraph title = new Paragraph("Reporte de Bienestar Estudiantil", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);
            document.add(new Paragraph(" "));

            PdfPTable table = new PdfPTable(2);
            table.setWidths(new float[]{60, 40});
            addCellKv(table, "Total Estudiantes", String.valueOf(overview.getOrDefault("totalStudents", 0)), boldFont, normalFont);
            addCellKv(table, "Total Evaluaciones", String.valueOf(overview.getOrDefault("totalEvaluations", 0)), boldFont, normalFont);
            addCellKv(table, "Casos Criticos", String.valueOf(overview.getOrDefault("criticalCases", 0)), boldFont, normalFont);
            addCellKv(table, "Seguros Activos", String.valueOf(overview.getOrDefault("activeInsurances", 0)), boldFont, normalFont);
            addCellKv(table, "Total Vacunas", String.valueOf(overview.getOrDefault("totalVaccinations", 0)), boldFont, normalFont);
            addCellKv(table, "Vacunas Completadas", String.valueOf(overview.getOrDefault("completedVaccinations", 0)), boldFont, normalFont);
            document.add(table);
            document.close();
        } catch (DocumentException e) {
            throw new RuntimeException("Error generating wellness report PDF", e);
        }
        return baos.toByteArray();
    }

    private void addCell(PdfPTable table, String text, Font font) {
        PdfPCell cell = new PdfPCell(new Paragraph(text, font));
        cell.setPadding(5);
        cell.setBackgroundColor(new java.awt.Color(60, 68, 54));
        table.addCell(cell);
    }

    private void addCellKv(PdfPTable table, String label, String value, Font labelFont, Font valueFont) {
        PdfPCell labelCell = new PdfPCell(new Paragraph(label, labelFont));
        labelCell.setPadding(6);
        labelCell.setBackgroundColor(new java.awt.Color(244, 241, 222));
        table.addCell(labelCell);
        PdfPCell valueCell = new PdfPCell(new Paragraph(value, valueFont));
        valueCell.setPadding(6);
        table.addCell(valueCell);
    }
}
