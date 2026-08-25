package com.leccionario.backend.studentmgmt.web;

import com.leccionario.backend.studentmgmt.*;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/student-wellness")
public class StudentWellnessController {

    private final StudentWellnessService wellnessService;

    public StudentWellnessController(StudentWellnessService wellnessService) { this.wellnessService = wellnessService; }

    @PostMapping("/psych")
    public ResponseEntity<?> saveEvaluation(@RequestBody PsychologicalEvaluation eval) { return ResponseEntity.ok(wellnessService.saveEvaluation(eval)); }

    @GetMapping("/psych/student/{studentId}")
    public ResponseEntity<?> getEvaluations(@PathVariable String studentId) {
        try {
            return ResponseEntity.ok(wellnessService.getEvaluations(Long.parseLong(studentId)));
        } catch (NumberFormatException e) {
            return ResponseEntity.ok(java.util.Collections.emptyList());
        }
    }

    @DeleteMapping("/psych/{id}")
    public ResponseEntity<?> deleteEvaluation(@PathVariable Long id) { wellnessService.deleteEvaluation(id); return ResponseEntity.ok().build(); }

    @GetMapping("/psych/stats")
    public ResponseEntity<Map<String, Object>> getPsychStats() { return ResponseEntity.ok(wellnessService.getPsychStats()); }

    @GetMapping("/overview")
    public ResponseEntity<Map<String, Object>> getWellnessOverview(@RequestParam Long institutionId) {
        try {
            return ResponseEntity.ok(wellnessService.getWellnessOverview(institutionId));
        } catch (Exception e) {
            return ResponseEntity.ok(new java.util.HashMap<>(Map.of(
                "totalStudents", 0, "totalEvaluations", 0, "criticalCases", 0,
                "activeInsurances", 0, "totalVaccinations", 0, "completedVaccinations", 0)));
        }
    }

    @PostMapping("/insurance")
    public ResponseEntity<?> saveInsurance(@RequestBody StudentInsurance ins) { return ResponseEntity.ok(wellnessService.saveInsurance(ins)); }

    @GetMapping("/insurance/student/{studentId}")
    public ResponseEntity<?> getInsurance(@PathVariable String studentId) {
        try {
            return ResponseEntity.ok(wellnessService.getInsurance(Long.parseLong(studentId)));
        } catch (NumberFormatException e) {
            return ResponseEntity.ok(java.util.Collections.emptyList());
        }
    }

    @DeleteMapping("/insurance/{id}")
    public ResponseEntity<?> deleteInsurance(@PathVariable Long id) { wellnessService.deleteInsurance(id); return ResponseEntity.ok().build(); }

    @GetMapping(value = "/psych/student/{studentId}/pdf", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]> getPsychEvaluationPdf(@PathVariable String studentId) {
        try {
            Long id = Long.parseLong(studentId);
            byte[] pdf = wellnessService.getPsychEvaluationPdf(id);
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=evaluaciones_psicologicas_" + id + ".pdf")
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(pdf);
        } catch (NumberFormatException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping(value = "/report", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]> getWellnessReport(@RequestParam Long institutionId) {
        byte[] pdf = wellnessService.getWellnessReportPdf(institutionId);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=reporte_bienestar.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }
}
