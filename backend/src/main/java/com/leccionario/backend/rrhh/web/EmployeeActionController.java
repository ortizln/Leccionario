package com.leccionario.backend.rrhh.web;

import com.leccionario.backend.rrhh.EmployeeAction;
import com.leccionario.backend.rrhh.EmployeeActionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/hr/actions")
@CrossOrigin(origins = "*")
public class EmployeeActionController {
    private final EmployeeActionService service;
    public EmployeeActionController(EmployeeActionService service) { this.service = service; }

    @GetMapping
    public ResponseEntity<List<EmployeeAction>> findAll(@RequestParam Long institutionId) {
        return ResponseEntity.ok(service.findAll(institutionId));
    }
    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<EmployeeAction>> findByEmployee(@PathVariable Long employeeId) {
        return ResponseEntity.ok(service.findByEmployee(employeeId));
    }
    @PostMapping
    public ResponseEntity<EmployeeAction> create(@RequestBody EmployeeAction a) { return ResponseEntity.ok(service.save(a)); }
    @PutMapping("/{id}")
    public ResponseEntity<EmployeeAction> update(@PathVariable Long id, @RequestBody EmployeeAction a) { a.setId(id); return ResponseEntity.ok(service.save(a)); }
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) { service.delete(id); return ResponseEntity.ok().build(); }
}
