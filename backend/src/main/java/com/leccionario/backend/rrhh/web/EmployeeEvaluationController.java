package com.leccionario.backend.rrhh.web;

import com.leccionario.backend.rrhh.EmployeeEvaluation;
import com.leccionario.backend.rrhh.EmployeeEvaluationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/hr/evaluations")
public class EmployeeEvaluationController {
    private final EmployeeEvaluationService service;
    public EmployeeEvaluationController(EmployeeEvaluationService service) { this.service = service; }

    @GetMapping
    public ResponseEntity<List<EmployeeEvaluation>> findAll(@RequestParam Long institutionId) {
        return ResponseEntity.ok(service.findAll(institutionId));
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<EmployeeEvaluation>> findByEmployee(@PathVariable Long employeeId) {
        return ResponseEntity.ok(service.findByEmployee(employeeId));
    }

    @GetMapping("/type/{type}")
    public ResponseEntity<List<EmployeeEvaluation>> findByType(@RequestParam Long institutionId, @PathVariable String type) {
        return ResponseEntity.ok(service.findByType(institutionId, type));
    }

    @PostMapping
    public ResponseEntity<EmployeeEvaluation> save(@RequestBody EmployeeEvaluation eval) {
        return ResponseEntity.ok(service.save(eval));
    }

    @PostMapping("/{id}/complete")
    public ResponseEntity<EmployeeEvaluation> complete(@PathVariable Long id, @RequestParam BigDecimal score, @RequestParam(required = false) String comments) {
        return ResponseEntity.ok(service.complete(id, score, comments));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}