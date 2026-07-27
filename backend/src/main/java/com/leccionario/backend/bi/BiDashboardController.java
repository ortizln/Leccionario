package com.leccionario.backend.bi;

import org.springframework.http.ResponseEntity;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bi")
@CrossOrigin(origins = "*")
@Tag(name = "Business Intelligence")
public class BiDashboardController {

    private final BiDashboardService biDashboardService;
    private final BiReportPdfService pdfService;

    public BiDashboardController(BiDashboardService biDashboardService, BiReportPdfService pdfService) {
        this.biDashboardService = biDashboardService;
        this.pdfService = pdfService;
    }

    @Operation(summary = "Dashboard de cursos")
    @GetMapping("/courses")
    public ResponseEntity<List<Map<String, Object>>> courseDashboard(@RequestParam Long institutionId) {
        return ResponseEntity.ok(biDashboardService.courseDashboard(institutionId));
    }

    @Operation(summary = "Dashboard de asistencia")
    @GetMapping("/attendance")
    public ResponseEntity<List<Map<String, Object>>> attendanceDashboard(@RequestParam Long institutionId) {
        return ResponseEntity.ok(biDashboardService.attendanceDashboard(institutionId));
    }

    @Operation(summary = "Dashboard de matrículas")
    @GetMapping("/enrollments")
    public ResponseEntity<List<Map<String, Object>>> enrollmentDashboard(@RequestParam Long institutionId) {
        return ResponseEntity.ok(biDashboardService.enrollmentDashboard(institutionId));
    }

    @Operation(summary = "Dashboard financiero")
    @GetMapping("/finance")
    public ResponseEntity<List<Map<String, Object>>> financeDashboard(@RequestParam Long institutionId) {
        return ResponseEntity.ok(biDashboardService.financeDashboard(institutionId));
    }

    @Operation(summary = "Dashboard de activos")
    @GetMapping("/assets")
    public ResponseEntity<List<Map<String, Object>>> assetDashboard(@RequestParam Long institutionId) {
        return ResponseEntity.ok(biDashboardService.assetDashboard(institutionId));
    }

    @Operation(summary = "Dashboard de biblioteca")
    @GetMapping("/library")
    public ResponseEntity<Map<String, Object>> libraryDashboard() {
        return ResponseEntity.ok(biDashboardService.libraryDashboard());
    }

    @Operation(summary = "Refrescar vistas materializadas")
    @PostMapping("/refresh")
    public ResponseEntity<String> refreshViews() {
        biDashboardService.refreshViews();
        return ResponseEntity.ok("Vistas actualizadas");
    }

    @Operation(summary = "Resumen general del dashboard")
    @GetMapping("/summary")
    public ResponseEntity<java.util.Map<String, Object>> getSummary(@RequestParam Long institutionId) {
        java.util.Map<String, Object> summary = new java.util.HashMap<>();
        summary.put("courses", biDashboardService.courseDashboard(institutionId));
        summary.put("finance", biDashboardService.financeDashboard(institutionId));
        summary.put("assets", biDashboardService.assetDashboard(institutionId));
        summary.put("enrollments", biDashboardService.enrollmentDashboard(institutionId));
        summary.put("library", biDashboardService.libraryDashboard());
        return ResponseEntity.ok(summary);
    }

    @Operation(summary = "Obtener indicadores KPI")
    @GetMapping("/kpis")
    public ResponseEntity<Map<String, Object>> getKPIs(@RequestParam Long institutionId) {
        return ResponseEntity.ok(biDashboardService.getKPIs(institutionId));
    }

    @Operation(summary = "Tendencia mensual")
    @GetMapping("/trend")
    public ResponseEntity<List<Map<String, Object>>> getMonthlyTrend(@RequestParam Long institutionId) {
        return ResponseEntity.ok(biDashboardService.getMonthlyTrend(institutionId));
    }

    @Operation(summary = "Ranking de docentes")
    @GetMapping("/teacher-ranking")
    public ResponseEntity<List<Map<String, Object>>> getTeacherRanking(@RequestParam Long institutionId) {
        return ResponseEntity.ok(biDashboardService.getTeacherRanking(institutionId));
    }

    @Operation(summary = "Distribución de estudiantes")
    @GetMapping("/student-distribution")
    public ResponseEntity<List<Map<String, Object>>> getStudentDistribution(@RequestParam Long institutionId) {
        return ResponseEntity.ok(biDashboardService.getStudentDistribution(institutionId));
    }

    @Operation(summary = "Distribución de calificaciones")
    @GetMapping("/grade-distribution")
    public ResponseEntity<Map<String, Object>> getGradeDistribution(@RequestParam Long institutionId) {
        return ResponseEntity.ok(biDashboardService.getGradeDistribution(institutionId));
    }

    @Operation(summary = "Tendencia de asistencia")
    @GetMapping("/attendance-trend")
    public ResponseEntity<List<Map<String, Object>>> getAttendanceTrend(@RequestParam Long institutionId) {
        return ResponseEntity.ok(biDashboardService.getAttendanceTrend(institutionId));
    }

    @Operation(summary = "Resumen financiero")
    @GetMapping("/financial-summary")
    public ResponseEntity<List<Map<String, Object>>> getFinancialSummary(@RequestParam Long institutionId) {
        return ResponseEntity.ok(biDashboardService.getFinancialSummary(institutionId));
    }

    @Operation(summary = "Estadísticas de comunicación")
    @GetMapping("/communication-stats")
    public ResponseEntity<Map<String, Object>> getCommunicationStats(@RequestParam Long institutionId) {
        return ResponseEntity.ok(biDashboardService.getCommunicationStats(institutionId));
    }

    @Operation(summary = "Estadísticas de conducta")
    @GetMapping("/conducta-stats")
    public ResponseEntity<Map<String, Object>> getConductaStats(@RequestParam Long institutionId) {
        return ResponseEntity.ok(biDashboardService.getConductaStats(institutionId));
    }

    @Operation(summary = "Resumen de nómina")
    @GetMapping("/payroll-summary")
    public ResponseEntity<Map<String, Object>> getPayrollSummary(@RequestParam Long institutionId) {
        return ResponseEntity.ok(biDashboardService.getPayrollSummary(institutionId));
    }

    @Operation(summary = "Resumen de recursos humanos")
    @GetMapping("/hr-summary")
    public ResponseEntity<Map<String, Object>> getHrSummary(@RequestParam Long institutionId) {
        return ResponseEntity.ok(biDashboardService.getHrSummary(institutionId));
    }

    @Operation(summary = "Exportar reporte en CSV")
    @GetMapping("/export/{type}")
    public ResponseEntity<byte[]> exportReport(@PathVariable String type, @RequestParam Long institutionId) {
        String filename;
        java.io.ByteArrayOutputStream baos = new java.io.ByteArrayOutputStream();
        java.io.PrintWriter writer = new java.io.PrintWriter(baos);

        try {
            switch (type) {
                case "courses" -> {
                    filename = "reporte_academico.csv";
                    writer.println("Curso,Periodo,Estudiantes,Promedio,Aprobados,Reprobados");
                    for (var row : biDashboardService.courseDashboard(institutionId)) {
                        writer.printf("%s,%s,%s,%s,%s,%s%n",
                            row.get("course_name"), row.get("period_name"),
                            row.get("enrolled_students"), row.get("average_score"),
                            row.get("passing_count"), row.get("failing_count"));
                    }
                }
                case "finance" -> {
                    filename = "reporte_financiero.csv";
                    writer.println("Mes,Facturas,Facturado,Cobrado,Pendiente");
                    for (var row : biDashboardService.financeDashboard(institutionId)) {
                        writer.printf("%s,%s,%s,%s,%s%n",
                            row.get("month"), row.get("total_invoices"),
                            row.get("total_billed"), row.get("total_collected"),
                            row.get("total_pending"));
                    }
                }
                case "enrollments" -> {
                    filename = "reporte_matriculas.csv";
                    writer.println("Periodo,Total,Activas,Retiradas");
                    for (var row : biDashboardService.enrollmentDashboard(institutionId)) {
                        writer.printf("%s,%s,%s,%s%n",
                            row.get("period_name"), row.get("total_enrollments"),
                            row.get("active_enrollments"), row.get("withdrawn"));
                    }
                }
                default -> {
                    return ResponseEntity.badRequest().build();
                }
            }
        } finally {
            writer.flush();
            writer.close();
        }

        return ResponseEntity.ok()
            .header("Content-Disposition", "attachment; filename=" + filename)
            .header("Content-Type", "text/csv; charset=UTF-8")
            .body(baos.toByteArray());
    }

    @Operation(summary = "Exportar reporte en PDF")
    @GetMapping("/pdf/{type}")
    public ResponseEntity<byte[]> exportPdf(@PathVariable String type, @RequestParam Long institutionId) {
        String filename;
        byte[] pdfBytes;

        switch (type) {
            case "academic" -> {
                filename = "reporte_academico.pdf";
                pdfBytes = pdfService.generateAcademicReport(institutionId);
            }
            case "financial" -> {
                filename = "reporte_financiero.pdf";
                pdfBytes = pdfService.generateFinancialReport(institutionId);
            }
            case "enrollment" -> {
                filename = "reporte_matriculas.pdf";
                pdfBytes = pdfService.generateEnrollmentReport(institutionId);
            }
            case "hr" -> {
                filename = "reporte_rrhh.pdf";
                pdfBytes = pdfService.generateHrReport(institutionId);
            }
            case "library" -> {
                filename = "reporte_biblioteca.pdf";
                pdfBytes = pdfService.generateLibraryReport(institutionId);
            }
            default -> {
                return ResponseEntity.badRequest().build();
            }
        }

        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=" + filename)
                .header("Content-Type", "application/pdf")
                .body(pdfBytes);
    }

    @Operation(summary = "Dashboard por rol de usuario")
    @GetMapping("/role-dashboard")
    public ResponseEntity<java.util.Map<String, Object>> getRoleDashboard(
            @RequestParam Long institutionId, @RequestParam String role) {
        java.util.Map<String, Object> dashboard = new java.util.LinkedHashMap<>();
        dashboard.put("role", role);
        dashboard.put("institutionId", institutionId);

        switch (role) {
            case "RECTOR":
                dashboard.put("kpis", biDashboardService.getKPIs(institutionId));
                dashboard.put("totalCourses", biDashboardService.getStudentDistribution(institutionId).size());
                dashboard.put("hrSummary", biDashboardService.getHrSummary(institutionId));
                dashboard.put("financialSummary", biDashboardService.getFinancialSummary(institutionId));
                break;
            case "INSPECTOR":
                dashboard.put("attendanceSummary", biDashboardService.getAttendanceTrend(institutionId));
                dashboard.put("conductSummary", biDashboardService.getConductaStats(institutionId));
                break;
            case "COORDINADOR":
                dashboard.put("studentDistribution", biDashboardService.getStudentDistribution(institutionId));
                dashboard.put("gradeDistribution", biDashboardService.getGradeDistribution(institutionId));
                dashboard.put("teacherRanking", biDashboardService.getTeacherRanking(institutionId));
                break;
            case "FINANCIERO":
                dashboard.put("financialSummary", biDashboardService.getFinancialSummary(institutionId));
                dashboard.put("kpis", biDashboardService.getKPIs(institutionId));
                dashboard.put("payrollSummary", biDashboardService.getPayrollSummary(institutionId));
                break;
            default:
                dashboard.put("kpis", biDashboardService.getKPIs(institutionId));
                break;
        }

        return ResponseEntity.ok(dashboard);
    }

    @Operation(summary = "Detalle de calificaciones")
    @GetMapping("/drill-down/grades")
    public ResponseEntity<Map<String, Object>> drillDownGrades(@RequestParam Long institutionId,
            @RequestParam(required = false) Long courseId, @RequestParam(required = false) String period) {
        Map<String, Object> result = new java.util.LinkedHashMap<>();
        result.put("gradeDistribution", biDashboardService.getGradeDistribution(institutionId));
        result.put("courseId", courseId);
        result.put("period", period);
        return ResponseEntity.ok(result);
    }

    @Operation(summary = "Detalle de asistencia")
    @GetMapping("/drill-down/attendance")
    public ResponseEntity<Map<String, Object>> drillDownAttendance(@RequestParam Long institutionId,
            @RequestParam(required = false) Long courseId) {
        Map<String, Object> result = new java.util.LinkedHashMap<>();
        result.put("attendanceTrend", biDashboardService.getAttendanceTrend(institutionId));
        result.put("courseId", courseId);
        return ResponseEntity.ok(result);
    }

    @Operation(summary = "Detalle financiero")
    @GetMapping("/drill-down/financial")
    public ResponseEntity<Map<String, Object>> drillDownFinancial(@RequestParam Long institutionId,
            @RequestParam(required = false) String period) {
        Map<String, Object> result = new java.util.LinkedHashMap<>();
        result.put("financialSummary", biDashboardService.getFinancialSummary(institutionId));
        result.put("payrollSummary", biDashboardService.getPayrollSummary(institutionId));
        result.put("period", period);
        return ResponseEntity.ok(result);
    }

    @Operation(summary = "Tendencias consolidadas")
    @GetMapping("/trends")
    public ResponseEntity<Map<String, Object>> getTrends(@RequestParam Long institutionId,
            @RequestParam(required = false, defaultValue = "6") int months) {
        Map<String, Object> result = new java.util.LinkedHashMap<>();
        result.put("monthlyTrend", biDashboardService.getMonthlyTrend(institutionId));
        result.put("attendanceTrend", biDashboardService.getAttendanceTrend(institutionId));
        result.put("financialTrend", biDashboardService.getFinancialSummary(institutionId));
        result.put("months", months);
        return ResponseEntity.ok(result);
    }

    @Operation(summary = "Gráfico de distribución de calificaciones")
    @GetMapping("/charts/grade-distribution")
    public ResponseEntity<Map<String, Object>> gradeDistributionChart(@RequestParam Long institutionId) {
        Map<String, Object> dist = biDashboardService.getGradeDistribution(institutionId);
        Map<String, Object> chart = new java.util.LinkedHashMap<>();
        chart.put("labels", new java.util.ArrayList<String>());
        chart.put("data", new java.util.ArrayList<Integer>());
        if (dist.containsKey("distribution")) {
            @SuppressWarnings("unchecked")
            java.util.List<Map<String, Object>> distribution = (java.util.List<Map<String, Object>>) dist.get("distribution");
            for (Map<String, Object> d : distribution) {
                ((java.util.List<String>) chart.get("labels")).add(String.valueOf(d.getOrDefault("grade", d.getOrDefault("range", ""))));
                ((java.util.List<Integer>) chart.get("data")).add((Integer) d.getOrDefault("count", 0));
            }
        }
        chart.put("total", dist.getOrDefault("total", 0));
        chart.put("average", dist.getOrDefault("average", 0));
        return ResponseEntity.ok(chart);
    }

    @Operation(summary = "Gráfico de tendencia de asistencia")
    @GetMapping("/charts/attendance-trend")
    public ResponseEntity<Map<String, Object>> attendanceTrendChart(@RequestParam Long institutionId) {
        java.util.List<Map<String, Object>> trend = biDashboardService.getAttendanceTrend(institutionId);
        Map<String, Object> chart = new java.util.LinkedHashMap<>();
        chart.put("labels", trend.stream().map(t -> String.valueOf(t.getOrDefault("period", t.getOrDefault("date", "")))).toList());
        chart.put("presentData", trend.stream().map(t -> t.getOrDefault("present_count", t.getOrDefault("presentCount", 0))).toList());
        chart.put("absentData", trend.stream().map(t -> t.getOrDefault("absent_count", t.getOrDefault("absentCount", 0))).toList());
        return ResponseEntity.ok(chart);
    }

    @Operation(summary = "Gráfico de matrículas por curso")
    @GetMapping("/charts/enrollment-by-course")
    public ResponseEntity<Map<String, Object>> enrollmentByCourseChart(@RequestParam Long institutionId) {
        java.util.List<Map<String, Object>> dist = biDashboardService.getStudentDistribution(institutionId);
        Map<String, Object> chart = new java.util.LinkedHashMap<>();
        chart.put("labels", dist.stream().map(d -> String.valueOf(d.getOrDefault("courseName", d.getOrDefault("name", "")))).toList());
        chart.put("data", dist.stream().map(d -> d.getOrDefault("studentCount", d.getOrDefault("count", 0))).toList());
        return ResponseEntity.ok(chart);
    }

    @Operation(summary = "Gráfico de resumen financiero")
    @GetMapping("/charts/financial-summary")
    public ResponseEntity<Map<String, Object>> financialSummaryChart(@RequestParam Long institutionId) {
        java.util.List<Map<String, Object>> summary = biDashboardService.getFinancialSummary(institutionId);
        Map<String, Object> chart = new java.util.LinkedHashMap<>();
        chart.put("labels", summary.stream().map(s -> String.valueOf(s.getOrDefault("period", s.getOrDefault("period_name", "")))).toList());
        chart.put("billedData", summary.stream().map(s -> s.getOrDefault("total_billed", 0)).toList());
        chart.put("collectedData", summary.stream().map(s -> s.getOrDefault("total_collected", 0)).toList());
        chart.put("pendingData", summary.stream().map(s -> s.getOrDefault("total_pending", 0)).toList());
        return ResponseEntity.ok(chart);
    }
}
