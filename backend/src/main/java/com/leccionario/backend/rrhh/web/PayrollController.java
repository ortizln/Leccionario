package com.leccionario.backend.rrhh.web;

import com.leccionario.backend.rrhh.Payroll;
import com.leccionario.backend.rrhh.PayrollEntry;
import com.leccionario.backend.rrhh.PayrollService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/hr/payrolls")
@CrossOrigin(origins = "*")
public class PayrollController {

    private final PayrollService payrollService;

    public PayrollController(PayrollService payrollService) { this.payrollService = payrollService; }

    @GetMapping
    public ResponseEntity<List<Payroll>> findAll(@RequestParam Long institutionId) {
        return ResponseEntity.ok(payrollService.findAll(institutionId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Payroll> findById(@PathVariable Long id) {
        return ResponseEntity.ok(payrollService.findById(id));
    }

    @PostMapping
    public ResponseEntity<Payroll> create(@RequestBody Payroll payroll) {
        return ResponseEntity.ok(payrollService.create(payroll));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Payroll> updateStatus(@PathVariable Long id, @RequestParam String status) {
        return ResponseEntity.ok(payrollService.updateStatus(id, status));
    }

    @GetMapping("/{id}/entries")
    public ResponseEntity<List<PayrollEntry>> getEntries(@PathVariable Long id) {
        return ResponseEntity.ok(payrollService.getEntries(id));
    }

    @PostMapping("/{id}/entries")
    public ResponseEntity<PayrollEntry> addEntry(@PathVariable Long id, @RequestBody PayrollEntry entry) {
        entry.setPayrollId(id);
        return ResponseEntity.ok(payrollService.addEntry(entry));
    }

    @DeleteMapping("/entries/{entryId}")
    public ResponseEntity<Void> deleteEntry(@PathVariable Long entryId) {
        payrollService.deleteEntry(entryId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats(@RequestParam Long institutionId) {
        return ResponseEntity.ok(payrollService.getPayrollStats(institutionId));
    }
}
