package com.leccionario.backend.report.web;

import com.leccionario.backend.report.dto.DashboardMetricsResponse;
import com.leccionario.backend.report.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
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

    @GetMapping(value = "/lesson-plans/export", produces = MediaType.TEXT_PLAIN_VALUE)
    @PreAuthorize("hasAuthority('REPORT_EXPORT')")
    public ResponseEntity<String> exportPlaceholder() {
        return ResponseEntity.ok("Placeholder de exportación PDF/Excel. Integrar JasperReports o Apache POI.");
    }
}
