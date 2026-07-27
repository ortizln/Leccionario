package com.leccionario.backend.rrhh.web;

import com.leccionario.backend.rrhh.Employee;
import com.leccionario.backend.rrhh.EmployeeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/hr/employees")
public class EmployeeController {

    private final EmployeeService employeeService;

    public EmployeeController(EmployeeService employeeService) { this.employeeService = employeeService; }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Employee employee) { return ResponseEntity.ok(employeeService.create(employee)); }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody Employee employee) { return ResponseEntity.ok(employeeService.update(id, employee)); }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) { employeeService.delete(id); return ResponseEntity.ok().build(); }

    @GetMapping("/{id}")
    public ResponseEntity<?> findById(@PathVariable Long id) { return ResponseEntity.ok(employeeService.findById(id)); }

    @GetMapping("/institution/{institutionId}")
    public ResponseEntity<?> findByInstitution(@PathVariable Long institutionId) { return ResponseEntity.ok(employeeService.findByInstitution(institutionId)); }

    @GetMapping("/institution/{institutionId}/active")
    public ResponseEntity<?> findActiveByInstitution(@PathVariable Long institutionId) { return ResponseEntity.ok(employeeService.findActiveByInstitution(institutionId)); }

    @GetMapping("/institution/{institutionId}/department/{department}")
    public ResponseEntity<?> findByDepartment(@PathVariable Long institutionId, @PathVariable String department) {
        return ResponseEntity.ok(employeeService.findByDepartment(institutionId, department));
    }

    @GetMapping("/stats/{institutionId}")
    public ResponseEntity<Map<String, Object>> getStats(@PathVariable Long institutionId) { return ResponseEntity.ok(employeeService.getStats(institutionId)); }
}
