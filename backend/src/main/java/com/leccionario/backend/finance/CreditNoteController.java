package com.leccionario.backend.finance;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/finance/credit-notes")
public class CreditNoteController {

    private final CreditNoteService creditNoteService;

    public CreditNoteController(CreditNoteService creditNoteService) {
        this.creditNoteService = creditNoteService;
    }

    @GetMapping
    public ResponseEntity<List<CreditNoteResponse>> findAll(@RequestParam Long institutionId) {
        return ResponseEntity.ok(creditNoteService.findAll(institutionId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CreditNoteResponse> findById(@PathVariable Long id) {
        return ResponseEntity.ok(creditNoteService.findById(id));
    }

    @PostMapping
    public ResponseEntity<CreditNoteResponse> create(@RequestBody Map<String, Object> body) {
        Long invoiceId = Long.valueOf(body.get("invoiceId").toString());
        Long studentId = Long.valueOf(body.get("studentId").toString());
        Long institutionId = Long.valueOf(body.get("institutionId").toString());
        java.math.BigDecimal amount = new java.math.BigDecimal(body.get("amount").toString());
        String reason = (String) body.get("reason");
        return ResponseEntity.ok(creditNoteService.create(invoiceId, studentId, institutionId, amount, reason));
    }

    @PutMapping("/{id}/apply")
    public ResponseEntity<CreditNoteResponse> apply(@PathVariable Long id) {
        return ResponseEntity.ok(creditNoteService.apply(id));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<CreditNoteResponse> cancel(@PathVariable Long id) {
        return ResponseEntity.ok(creditNoteService.cancel(id));
    }
}