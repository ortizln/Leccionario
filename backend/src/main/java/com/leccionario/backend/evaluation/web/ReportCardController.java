package com.leccionario.backend.evaluation.web;

import com.leccionario.backend.academicpdf.AcademicPdfService;
import com.leccionario.backend.evaluation.dto.ReportCardRequest;
import com.leccionario.backend.evaluation.dto.ReportCardResponse;
import com.leccionario.backend.evaluation.service.ReportCardService;
import jakarta.validation.Valid;
import java.security.Principal;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/report-cards")
@RequiredArgsConstructor
public class ReportCardController {

    private final ReportCardService reportCardService;
    private final AcademicPdfService academicPdfService;

    @PostMapping("/generate")
    @PreAuthorize("hasAuthority('GRADE_MANAGE')")
    public ResponseEntity<ReportCardResponse> generate(
            @Valid @RequestBody ReportCardRequest request,
            Principal principal) {
        return ResponseEntity.ok(reportCardService.generateReportCard(request, principal.getName()));
    }

    @GetMapping
    @PreAuthorize("hasAuthority('GRADE_VIEW')")
    public ResponseEntity<ReportCardResponse> getReportCard(
            @RequestParam Long studentId,
            @RequestParam Long courseId,
            @RequestParam Long periodId) {
        return ResponseEntity.ok(reportCardService.getReportCard(studentId, courseId, periodId));
    }

    @GetMapping("/period/{periodId}")
    @PreAuthorize("hasAuthority('GRADE_VIEW')")
    public ResponseEntity<List<ReportCardResponse>> getByPeriod(@PathVariable Long periodId) {
        return ResponseEntity.ok(reportCardService.getReportCardsByPeriod(periodId));
    }

    @GetMapping("/course/{courseId}/period/{periodId}")
    @PreAuthorize("hasAuthority('GRADE_VIEW')")
    public ResponseEntity<List<ReportCardResponse>> getByCourseAndPeriod(
            @PathVariable Long courseId,
            @PathVariable Long periodId) {
        return ResponseEntity.ok(reportCardService.getReportCardsByCourseAndPeriod(courseId, periodId));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAuthority('GRADE_MANAGE')")
    public ResponseEntity<ReportCardResponse> updateStatus(
            @PathVariable Long id,
            @RequestParam String status,
            Principal principal) {
        return ResponseEntity.ok(reportCardService.updateStatus(id, status, principal.getName()));
    }

    @GetMapping("/stats/{periodId}")
    @PreAuthorize("hasAuthority('GRADE_VIEW')")
    public ResponseEntity<Map<String, Object>> getStats(@PathVariable Long periodId) {
        return ResponseEntity.ok(reportCardService.getReportCardStats(periodId));
    }

    @GetMapping("/history/{studentId}")
    @PreAuthorize("hasAuthority('GRADE_VIEW')")
    public ResponseEntity<?> getAcademicHistory(@PathVariable Long studentId) {
        return ResponseEntity.ok(reportCardService.getAcademicHistory(studentId));
    }

    @GetMapping("/{id}/pdf")
    @PreAuthorize("hasAuthority('GRADE_VIEW')")
    public ResponseEntity<byte[]> downloadPdf(@PathVariable Long id) {
        byte[] pdf = academicPdfService.generateReportCardPdf(id);
        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=libreta_" + id + ".pdf")
                .header("Content-Type", "application/pdf")
                .body(pdf);
    }
}
