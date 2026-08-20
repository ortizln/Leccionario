package com.leccionario.backend.rrhh.web;

import com.leccionario.backend.rrhh.EmployeeBenefit;
import com.leccionario.backend.rrhh.EmployeeBenefitService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/hr/benefits")
public class EmployeeBenefitController {
    private final EmployeeBenefitService service;
    public EmployeeBenefitController(EmployeeBenefitService service) { this.service = service; }

    @GetMapping
    public ResponseEntity<List<EmployeeBenefit>> findAll(@RequestParam Long institutionId) {
        return ResponseEntity.ok(service.findAll(institutionId));
    }
    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<EmployeeBenefit>> findByEmployee(@PathVariable Long employeeId) {
        return ResponseEntity.ok(service.findByEmployee(employeeId));
    }
    @PostMapping
    public ResponseEntity<EmployeeBenefit> create(@RequestBody EmployeeBenefit b) { return ResponseEntity.ok(service.save(b)); }
    @PutMapping("/{id}")
    public ResponseEntity<EmployeeBenefit> update(@PathVariable Long id, @RequestBody EmployeeBenefit b) { b.setId(id); return ResponseEntity.ok(service.save(b)); }
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) { service.delete(id); return ResponseEntity.ok().build(); }
}