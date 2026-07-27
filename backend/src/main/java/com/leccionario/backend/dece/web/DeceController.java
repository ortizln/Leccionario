package com.leccionario.backend.dece.web;

import com.leccionario.backend.dece.DeceCase;
import com.leccionario.backend.dece.DeceFollowUp;
import com.leccionario.backend.dece.DeceService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/dece")
public class DeceController {

    private final DeceService deceService;

    public DeceController(DeceService deceService) {
        this.deceService = deceService;
    }

    @PostMapping("/cases")
    public ResponseEntity<?> createCase(@RequestBody DeceCase deceCase, Authentication auth) {
        return ResponseEntity.ok(deceService.create(deceCase, auth.getName()));
    }

    @PutMapping("/cases/{id}")
    public ResponseEntity<?> updateCase(@PathVariable Long id, @RequestBody DeceCase deceCase) {
        return ResponseEntity.ok(deceService.update(id, deceCase));
    }

    @DeleteMapping("/cases/{id}")
    public ResponseEntity<?> deleteCase(@PathVariable Long id) {
        deceService.delete(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/cases/{id}")
    public ResponseEntity<?> findCaseById(@PathVariable Long id) {
        return ResponseEntity.ok(deceService.findById(id));
    }

    @GetMapping("/cases/student/{studentId}")
    public ResponseEntity<?> findCasesByStudent(@PathVariable Long studentId) {
        return ResponseEntity.ok(deceService.findByStudent(studentId));
    }

    @GetMapping("/cases/open")
    public ResponseEntity<?> findOpenCases() {
        return ResponseEntity.ok(deceService.findOpen());
    }

    @GetMapping("/cases/type/{caseType}")
    public ResponseEntity<?> findCasesByType(@PathVariable String caseType) {
        return ResponseEntity.ok(deceService.findByType(caseType));
    }

    @PostMapping("/cases/{caseId}/follow-ups")
    public ResponseEntity<?> addFollowUp(
            @PathVariable Long caseId, @RequestBody DeceFollowUp followUp, Authentication auth) {
        return ResponseEntity.ok(deceService.addFollowUp(caseId, followUp, auth.getName()));
    }

    @GetMapping("/cases/{caseId}/follow-ups")
    public ResponseEntity<?> getFollowUps(@PathVariable Long caseId) {
        return ResponseEntity.ok(deceService.getFollowUps(caseId));
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        return ResponseEntity.ok(deceService.getStats());
    }
}
