package com.leccionario.backend.report.web;

import com.leccionario.backend.report.dto.DashboardMetricsResponse;
import com.leccionario.backend.report.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/dashboard")
    @PreAuthorize("hasAuthority('REPORT_VIEW')")
    public ResponseEntity<DashboardMetricsResponse> dashboard() {
        return ResponseEntity.ok(reportService.getDashboardMetrics());
    }

    @GetMapping(value = "/lesson-plans/export", produces = MediaType.APPLICATION_PDF_VALUE)
    @PreAuthorize("hasAuthority('REPORT_EXPORT')")
    public ResponseEntity<byte[]> exportLessonPlans(@RequestParam(defaultValue = "1") Long institutionId) {
        byte[] pdf = reportService.exportLessonPlansPdf(institutionId);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=reporte_leccionarios.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }
}
