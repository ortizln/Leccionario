package com.leccionario.backend.conduct.web;

import com.leccionario.backend.conduct.dto.MeritCategoryResponse;
import com.leccionario.backend.conduct.dto.StudentMeritRequest;
import com.leccionario.backend.conduct.dto.StudentMeritResponse;
import com.leccionario.backend.conduct.service.ConductService;
import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import jakarta.validation.Valid;
import java.io.ByteArrayOutputStream;
import java.security.Principal;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/conduct")
@RequiredArgsConstructor
public class ConductController {

    private final ConductService conductService;

    // --- Merit Categories ---

    @GetMapping("/merit-categories")
    @PreAuthorize("hasAuthority('MERITO_VIEW')")
    public ResponseEntity<List<MeritCategoryResponse>> getMeritCategories(@RequestParam Long institutionId) {
        return ResponseEntity.ok(conductService.getMeritCategories(institutionId));
    }

    @PostMapping("/merit-categories")
    @PreAuthorize("hasAuthority('MERITO_MANAGE')")
    public ResponseEntity<MeritCategoryResponse> createMeritCategory(
            @RequestBody MeritCategoryResponse request,
            @RequestParam Long institutionId) {
        return ResponseEntity.ok(conductService.createMeritCategory(request, institutionId));
    }

    @DeleteMapping("/merit-categories/{id}")
    @PreAuthorize("hasAuthority('MERITO_MANAGE')")
    public ResponseEntity<Void> deleteMeritCategory(@PathVariable Long id) {
        conductService.deleteMeritCategory(id);
        return ResponseEntity.ok().build();
    }

    // --- Student Merits ---

    @PostMapping("/merits")
    @PreAuthorize("hasAuthority('MERITO_MANAGE')")
    public ResponseEntity<StudentMeritResponse> registerMerit(
            @Valid @RequestBody StudentMeritRequest request,
            Principal principal) {
        return ResponseEntity.ok(conductService.registerMerit(request, principal.getName()));
    }

    @GetMapping("/merits/student/{studentId}/period/{periodId}")
    @PreAuthorize("hasAuthority('CONDUCTA_VIEW')")
    public ResponseEntity<List<StudentMeritResponse>> getStudentMerits(
            @PathVariable Long studentId, @PathVariable Long periodId) {
        return ResponseEntity.ok(conductService.getStudentMerits(studentId, periodId));
    }

    @GetMapping("/merits/course/{courseId}/period/{periodId}")
    @PreAuthorize("hasAuthority('CONDUCTA_VIEW')")
    public ResponseEntity<List<StudentMeritResponse>> getCourseMerits(
            @PathVariable Long courseId, @PathVariable Long periodId) {
        return ResponseEntity.ok(conductService.getCourseMerits(courseId, periodId));
    }

    @GetMapping("/merits/course/{courseId}/period/{periodId}/stats")
    @PreAuthorize("hasAuthority('CONDUCTA_VIEW')")
    public ResponseEntity<Map<String, Object>> getCourseMeritStats(
            @PathVariable Long courseId, @PathVariable Long periodId) {
        return ResponseEntity.ok(conductService.getCourseMeritStats(courseId, periodId));
    }

    @GetMapping("/merits/student/{studentId}/period/{periodId}/stats")
    @PreAuthorize("hasAuthority('CONDUCTA_VIEW')")
    public ResponseEntity<Map<String, Object>> getStudentMeritStats(
            @PathVariable Long studentId, @PathVariable Long periodId) {
        return ResponseEntity.ok(conductService.getStudentMeritStats(studentId, periodId));
    }

    // --- Conduct Summary ---

    @GetMapping("/summary/student/{studentId}/period/{periodId}")
    @PreAuthorize("hasAuthority('CONDUCTA_VIEW')")
    public ResponseEntity<Map<String, Object>> getConductSummary(
            @PathVariable Long studentId, @PathVariable Long periodId) {
        return ResponseEntity.ok(conductService.getConductSummary(studentId, periodId));
    }

    @GetMapping("/merits/student/{studentId}")
    @PreAuthorize("hasAuthority('CONDUCTA_VIEW')")
    public ResponseEntity<List<StudentMeritResponse>> getStudentMeritsAll(
            @PathVariable Long studentId) {
        return ResponseEntity.ok(conductService.getStudentMeritsAll(studentId));
    }

    @GetMapping(value = "/report/student/{studentId}", produces = MediaType.APPLICATION_PDF_VALUE)
    @PreAuthorize("hasAuthority('CONDUCTA_VIEW')")
    public ResponseEntity<byte[]> getConductReportPdf(@PathVariable Long studentId) {
        List<StudentMeritResponse> merits = conductService.getStudentMeritsAll(studentId);
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("dd/MM/yyyy");

        try {
            Document document = new Document(PageSize.LETTER, 40, 40, 40, 40);
            PdfWriter.getInstance(document, baos);
            document.open();

            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16);
            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, java.awt.Color.WHITE);
            Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 10);

            Paragraph title = new Paragraph("Reporte de Conducta - Estudiante #" + studentId, titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);
            document.add(new Paragraph(" "));

            PdfPTable table = new PdfPTable(5);
            table.setWidths(new float[]{15, 25, 20, 20, 20});
            addCell(table, "Fecha", headerFont);
            addCell(table, "Categoria", headerFont);
            addCell(table, "Periodo", headerFont);
            addCell(table, "Puntos", headerFont);
            addCell(table, "Descripcion", headerFont);

            int totalPoints = 0;
            for (StudentMeritResponse m : merits) {
                addCell(table, m.getMeritDate() != null ? m.getMeritDate().format(fmt) : "", normalFont);
                addCell(table, m.getCategoryName() != null ? m.getCategoryName() : "", normalFont);
                addCell(table, m.getAcademicPeriodName() != null ? m.getAcademicPeriodName() : "", normalFont);
                addCell(table, m.getPoints() != null ? String.valueOf(m.getPoints()) : "0", normalFont);
                addCell(table, m.getDescription() != null ? m.getDescription() : "", normalFont);
                if (m.getPoints() != null) totalPoints += m.getPoints();
            }
            if (merits.isEmpty()) {
                PdfPCell empty = new PdfPCell(new Paragraph("Sin registros de conducta", normalFont));
                empty.setColspan(5);
                table.addCell(empty);
            }
            document.add(table);
            document.add(new Paragraph(" "));
            document.add(new Paragraph("Total Puntos: " + totalPoints, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12)));
            document.close();
        } catch (Exception e) {
            throw new RuntimeException("Error generating conduct report PDF", e);
        }
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=reporte_conducta_" + studentId + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(baos.toByteArray());
    }

    private void addCell(PdfPTable table, String text, Font font) {
        PdfPCell cell = new PdfPCell(new Paragraph(text, font));
        cell.setPadding(5);
        table.addCell(cell);
    }
}
