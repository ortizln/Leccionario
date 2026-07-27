package com.leccionario.backend.studentmgmt.web;

import com.leccionario.backend.studentmgmt.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;

@RestController
@RequestMapping("/api/scholarships")
public class ScholarshipController {

    private final ScholarshipService scholarshipService;

    public ScholarshipController(ScholarshipService scholarshipService) { this.scholarshipService = scholarshipService; }

    @PostMapping("/types")
    public ResponseEntity<?> createType(@RequestBody ScholarshipType type) { return ResponseEntity.ok(scholarshipService.createType(type)); }

    @GetMapping("/types/institution/{institutionId}")
    public ResponseEntity<?> findTypes(@PathVariable Long institutionId) { return ResponseEntity.ok(scholarshipService.findTypes(institutionId)); }

    @DeleteMapping("/types/{id}")
    public ResponseEntity<?> deleteType(@PathVariable Long id) { scholarshipService.deleteType(id); return ResponseEntity.ok().build(); }

    @PostMapping("/applications")
    public ResponseEntity<?> createApplication(@RequestBody ScholarshipApplication app) { return ResponseEntity.ok(scholarshipService.createApplication(app)); }

    @GetMapping("/applications/student/{studentId}")
    public ResponseEntity<?> findByStudent(@PathVariable Long studentId) { return ResponseEntity.ok(scholarshipService.findByStudent(studentId)); }

    @GetMapping("/applications/pending")
    public ResponseEntity<?> findPending() { return ResponseEntity.ok(scholarshipService.findPending()); }

    @PutMapping("/applications/{id}/approve")
    public ResponseEntity<?> approve(@PathVariable Long id, @RequestParam(required = false) BigDecimal amount, Authentication auth) {
        return ResponseEntity.ok(scholarshipService.approve(id, auth.getName(), amount));
    }

    @PutMapping("/applications/{id}/reject")
    public ResponseEntity<?> reject(@PathVariable Long id, @RequestParam(required = false) String observations, Authentication auth) {
        return ResponseEntity.ok(scholarshipService.reject(id, auth.getName(), observations));
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getStats(@RequestParam Long institutionId) {
        return ResponseEntity.ok(scholarshipService.getStats(institutionId));
    }
}
