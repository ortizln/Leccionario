package com.leccionario.backend.export.web;

import com.leccionario.backend.export.ExportService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/export")
@CrossOrigin(origins = "*")
@Tag(name = "Exportación CSV")
public class ExportController {

    private final ExportService exportService;

    public ExportController(ExportService exportService) { this.exportService = exportService; }

    @Operation(summary = "Exportar estudiantes en CSV")
    @GetMapping("/students")
    public ResponseEntity<byte[]> exportStudents(@RequestParam Long institutionId) {
        return sendCsv(exportService.exportStudentsCsv(institutionId), "estudiantes.csv");
    }

    @Operation(summary = "Exportar empleados en CSV")
    @GetMapping("/employees")
    public ResponseEntity<byte[]> exportEmployees(@RequestParam Long institutionId) {
        return sendCsv(exportService.exportEmployeesCsv(institutionId), "empleados.csv");
    }

    @Operation(summary = "Exportar facturas en CSV")
    @GetMapping("/invoices")
    public ResponseEntity<byte[]> exportInvoices(@RequestParam Long institutionId) {
        return sendCsv(exportService.exportInvoicesCsv(institutionId), "facturas.csv");
    }

    @Operation(summary = "Exportar activos en CSV")
    @GetMapping("/assets")
    public ResponseEntity<byte[]> exportAssets(@RequestParam Long institutionId) {
        return sendCsv(exportService.exportAssetsCsv(institutionId), "activos.csv");
    }

    @Operation(summary = "Exportar libros en CSV")
    @GetMapping("/books")
    public ResponseEntity<byte[]> exportBooks(@RequestParam Long institutionId) {
        return sendCsv(exportService.exportBooksCsv(institutionId), "libros.csv");
    }

    @Operation(summary = "Exportar nómina en CSV")
    @GetMapping("/payroll")
    public ResponseEntity<byte[]> exportPayroll(@RequestParam Long institutionId) {
        return sendCsv(exportService.exportPayrollCsv(institutionId), "nomina.csv");
    }

    private ResponseEntity<byte[]> sendCsv(byte[] data, String filename) {
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
            .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
            .body(data);
    }
}
