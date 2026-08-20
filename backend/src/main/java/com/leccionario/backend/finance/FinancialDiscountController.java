package com.leccionario.backend.finance;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/finance/discounts")
public class FinancialDiscountController {
    private final FinancialDiscountService service;
    public FinancialDiscountController(FinancialDiscountService service) { this.service = service; }

    @GetMapping
    public ResponseEntity<List<FinancialDiscount>> findAll(@RequestParam Long institutionId) {
        return ResponseEntity.ok(service.findAll(institutionId));
    }

    @GetMapping("/active")
    public ResponseEntity<List<FinancialDiscount>> findActive(@RequestParam Long institutionId) {
        return ResponseEntity.ok(service.findActive(institutionId));
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<FinancialDiscount>> findByStudent(@PathVariable Long studentId) {
        return ResponseEntity.ok(service.findByStudent(studentId));
    }

    @PostMapping
    public ResponseEntity<FinancialDiscount> save(@RequestBody FinancialDiscount discount) {
        return ResponseEntity.ok(service.save(discount));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}