package com.leccionario.backend.export.web;

import com.leccionario.backend.export.ExportService;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayOutputStream;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/export")
@Tag(name = "Exportación de Datos")
public class ExportController {

    private final ExportService exportService;

    public ExportController(ExportService exportService) { this.exportService = exportService; }

    @Operation(summary = "Exportar estudiantes en CSV")
    @GetMapping("/students/csv")
    @PreAuthorize("hasAuthority('REPORT_EXPORT')")
    public ResponseEntity<byte[]> exportStudentsCsv(@RequestParam Long institutionId) {
        byte[] data = exportService.exportStudentsCsv(institutionId);
        return sendFile(data, "estudiantes.csv", "text/csv; charset=UTF-8");
    }

    @Operation(summary = "Exportar empleados en CSV")
    @GetMapping("/employees/csv")
    @PreAuthorize("hasAuthority('REPORT_EXPORT')")
    public ResponseEntity<byte[]> exportEmployeesCsv(@RequestParam Long institutionId) {
        byte[] data = exportService.exportEmployeesCsv(institutionId);
        return sendFile(data, "empleados.csv", "text/csv; charset=UTF-8");
    }

    @Operation(summary = "Exportar facturas en CSV")
    @GetMapping("/invoices/csv")
    @PreAuthorize("hasAuthority('REPORT_EXPORT')")
    public ResponseEntity<byte[]> exportInvoicesCsv(@RequestParam Long institutionId) {
        byte[] data = exportService.exportInvoicesCsv(institutionId);
        return sendFile(data, "facturas.csv", "text/csv; charset=UTF-8");
    }

    @Operation(summary = "Exportar activos en CSV")
    @GetMapping("/assets/csv")
    @PreAuthorize("hasAuthority('REPORT_EXPORT')")
    public ResponseEntity<byte[]> exportAssetsCsv(@RequestParam Long institutionId) {
        byte[] data = exportService.exportAssetsCsv(institutionId);
        return sendFile(data, "activos.csv", "text/csv; charset=UTF-8");
    }

    @Operation(summary = "Exportar libros en CSV")
    @GetMapping("/books/csv")
    @PreAuthorize("hasAuthority('REPORT_EXPORT')")
    public ResponseEntity<byte[]> exportBooksCsv(@RequestParam Long institutionId) {
        byte[] data = exportService.exportBooksCsv(institutionId);
        return sendFile(data, "libros.csv", "text/csv; charset=UTF-8");
    }

    @Operation(summary = "Exportar nómina en CSV")
    @GetMapping("/payroll/csv")
    @PreAuthorize("hasAuthority('REPORT_EXPORT')")
    public ResponseEntity<byte[]> exportPayrollCsv(@RequestParam Long institutionId) {
        byte[] data = exportService.exportPayrollCsv(institutionId);
        return sendFile(data, "nomina.csv", "text/csv; charset=UTF-8");
    }

    @Operation(summary = "Exportar estudiantes en Excel")
    @GetMapping("/students/excel")
    @PreAuthorize("hasAuthority('REPORT_EXPORT')")
    public ResponseEntity<byte[]> exportStudentsExcel(@RequestParam Long institutionId) {
        byte[] data = exportService.exportStudentsCsv(institutionId);
        byte[] excel = convertCsvToExcel(data, "Estudiantes");
        return sendFile(excel, "estudiantes.xlsx",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    }

    @Operation(summary = "Exportar empleados en Excel")
    @GetMapping("/employees/excel")
    @PreAuthorize("hasAuthority('REPORT_EXPORT')")
    public ResponseEntity<byte[]> exportEmployeesExcel(@RequestParam Long institutionId) {
        byte[] data = exportService.exportEmployeesCsv(institutionId);
        byte[] excel = convertCsvToExcel(data, "Empleados");
        return sendFile(excel, "empleados.xlsx",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    }

    @Operation(summary = "Exportar facturas en Excel")
    @GetMapping("/invoices/excel")
    @PreAuthorize("hasAuthority('REPORT_EXPORT')")
    public ResponseEntity<byte[]> exportInvoicesExcel(@RequestParam Long institutionId) {
        byte[] data = exportService.exportInvoicesCsv(institutionId);
        byte[] excel = convertCsvToExcel(data, "Facturas");
        return sendFile(excel, "facturas.xlsx",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    }

    @Operation(summary = "Exportar activos en Excel")
    @GetMapping("/assets/excel")
    @PreAuthorize("hasAuthority('REPORT_EXPORT')")
    public ResponseEntity<byte[]> exportAssetsExcel(@RequestParam Long institutionId) {
        byte[] data = exportService.exportAssetsCsv(institutionId);
        byte[] excel = convertCsvToExcel(data, "Activos");
        return sendFile(excel, "activos.xlsx",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    }

    @Operation(summary = "Exportar libros en Excel")
    @GetMapping("/books/excel")
    @PreAuthorize("hasAuthority('REPORT_EXPORT')")
    public ResponseEntity<byte[]> exportBooksExcel(@RequestParam Long institutionId) {
        byte[] data = exportService.exportBooksCsv(institutionId);
        byte[] excel = convertCsvToExcel(data, "Libros");
        return sendFile(excel, "libros.xlsx",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    }

    @Operation(summary = "Exportar nómina en Excel")
    @GetMapping("/payroll/excel")
    @PreAuthorize("hasAuthority('REPORT_EXPORT')")
    public ResponseEntity<byte[]> exportPayrollExcel(@RequestParam Long institutionId) {
        byte[] data = exportService.exportPayrollCsv(institutionId);
        byte[] excel = convertCsvToExcel(data, "Nómina");
        return sendFile(excel, "nomina.xlsx",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    }

    private byte[] convertCsvToExcel(byte[] csvData, String sheetName) {
        try (Workbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream bos = new ByteArrayOutputStream()) {

            Sheet sheet = workbook.createSheet(sheetName);
            String csvContent = new String(csvData, "UTF-8");
            String[] lines = csvContent.split("\n");

            for (int i = 0; i < lines.length; i++) {
                Row row = sheet.createRow(i);
                String[] cells = parseCsvLine(lines[i]);
                for (int j = 0; j < cells.length; j++) {
                    Cell cell = row.createCell(j);
                    cell.setCellValue(cells[j].trim());
                    if (i == 0) {
                        CellStyle headerStyle = workbook.createCellStyle();
                        Font headerFont = workbook.createFont();
                        headerFont.setBold(true);
                        headerStyle.setFont(headerFont);
                        cell.setCellStyle(headerStyle);
                    }
                }
            }

            for (int i = 0; i < lines.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(bos);
            return bos.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Error converting CSV to Excel", e);
        }
    }

    private String[] parseCsvLine(String line) {
        java.util.List<String> result = new java.util.ArrayList<>();
        StringBuilder current = new StringBuilder();
        boolean inQuotes = false;

        for (char c : line.toCharArray()) {
            if (c == '"') {
                inQuotes = !inQuotes;
            } else if (c == ',' && !inQuotes) {
                result.add(current.toString());
                current = new StringBuilder();
            } else {
                current.append(c);
            }
        }
        result.add(current.toString());
        return result.toArray(new String[0]);
    }

    private ResponseEntity<byte[]> sendFile(byte[] data, String filename, String contentType) {
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                .contentType(MediaType.parseMediaType(contentType))
                .body(data);
    }
}
