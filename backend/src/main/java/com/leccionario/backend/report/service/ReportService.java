package com.leccionario.backend.report.service;

import com.leccionario.backend.evaluation.repository.EvaluationRepository;
import com.leccionario.backend.lessonplan.domain.LessonPlan;
import com.leccionario.backend.lessonplan.repository.LessonPlanRepository;
import com.leccionario.backend.report.dto.DashboardMetricsResponse;
import com.leccionario.backend.user.repository.StudentRepository;
import com.leccionario.backend.user.repository.TeacherRepository;
import com.leccionario.backend.user.repository.UserRepository;
import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ReportService {

    private final UserRepository userRepository;
    private final TeacherRepository teacherRepository;
    private final StudentRepository studentRepository;
    private final LessonPlanRepository lessonPlanRepository;
    private final EvaluationRepository evaluationRepository;

    public DashboardMetricsResponse getDashboardMetrics() {
        return new DashboardMetricsResponse(
                userRepository.count(),
                teacherRepository.count(),
                studentRepository.count(),
                lessonPlanRepository.count(),
                evaluationRepository.count());
    }

    public byte[] exportLessonPlansPdf(Long institutionId) {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4, 36, 36, 36, 36);

        try {
            PdfWriter.getInstance(document, baos);
            document.open();

            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16);
            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10);
            Font bodyFont = FontFactory.getFont(FontFactory.HELVETICA, 9);

            document.add(new Paragraph("Leccionario - Reporte de Planes de Clase", titleFont));
            document.add(new Paragraph("Fecha: " + LocalDate.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"))));
            document.add(new Paragraph(" "));

            List<LessonPlan> plans = lessonPlanRepository.findAll();
            PdfPTable table = new PdfPTable(5);
            table.setWidthPercentage(100);
            table.setWidths(new float[]{3f, 3f, 2f, 2f, 2f});

            String[] headers = {"Docente", "Materia", "Curso", "Periodo", "Avance"};
            for (String h : headers) {
                com.lowagie.text.pdf.PdfPCell cell = new com.lowagie.text.pdf.PdfPCell(new Paragraph(h, headerFont));
                cell.setBackgroundColor(new java.awt.Color(230, 230, 230));
                table.addCell(cell);
            }

            for (LessonPlan lp : plans) {
                table.addCell(new Paragraph(lp.getTeacher() != null ? lp.getTeacher().getUser().getFirstName() + " " + lp.getTeacher().getUser().getLastName() : "-", bodyFont));
                table.addCell(new Paragraph(lp.getSubject() != null ? lp.getSubject().getName() : "-", bodyFont));
                table.addCell(new Paragraph(lp.getCourse() != null ? lp.getCourse().getName() : "-", bodyFont));
                table.addCell(new Paragraph(lp.getPeriod() != null ? lp.getPeriod().getName() : "-", bodyFont));
                table.addCell(new Paragraph(lp.isCurriculumCompleted() ? "Completo" : "En progreso", bodyFont));
            }

            document.add(table);
            document.add(new Paragraph(" "));
            document.add(new Paragraph("Total de planes: " + plans.size(), bodyFont));
            document.close();
        } catch (DocumentException e) {
            throw new RuntimeException("Error generating PDF", e);
        }

        return baos.toByteArray();
    }
}
