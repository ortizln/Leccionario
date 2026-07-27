package com.leccionario.backend.rrhh.web;

import com.leccionario.backend.rrhh.EmploymentContract;
import com.leccionario.backend.rrhh.ContractService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/hr/contracts")
public class ContractController {

    private final ContractService contractService;

    public ContractController(ContractService contractService) { this.contractService = contractService; }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody EmploymentContract contract, Authentication auth) {
        return ResponseEntity.ok(contractService.create(contract, auth.getName()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody EmploymentContract contract) {
        return ResponseEntity.ok(contractService.update(id, contract));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) { contractService.delete(id); return ResponseEntity.ok().build(); }

    @GetMapping("/{id}")
    public ResponseEntity<?> findById(@PathVariable Long id) { return ResponseEntity.ok(contractService.findById(id)); }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<?> findByEmployee(@PathVariable Long employeeId) { return ResponseEntity.ok(contractService.findByEmployee(employeeId)); }

    @GetMapping("/employee/{employeeId}/active")
    public ResponseEntity<?> findActiveByEmployee(@PathVariable Long employeeId) { return ResponseEntity.ok(contractService.findActiveByEmployee(employeeId)); }

    @GetMapping("/active")
    public ResponseEntity<?> findActive() { return ResponseEntity.ok(contractService.findActive()); }
}
