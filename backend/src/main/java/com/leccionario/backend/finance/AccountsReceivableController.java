package com.leccionario.backend.finance;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/finance/accounts-receivable")
public class AccountsReceivableController {

    private final AccountsReceivableService accountsReceivableService;

    public AccountsReceivableController(AccountsReceivableService accountsReceivableService) {
        this.accountsReceivableService = accountsReceivableService;
    }

    @GetMapping("/pending")
    public ResponseEntity<List<AccountsReceivableResponse>> findPending(@RequestParam Long institutionId) {
        return ResponseEntity.ok(accountsReceivableService.findPending(institutionId));
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<AccountsReceivableResponse>> findByStudent(@PathVariable Long studentId) {
        return ResponseEntity.ok(accountsReceivableService.findByStudent(studentId));
    }

    @PostMapping
    public ResponseEntity<AccountsReceivableResponse> create(@RequestBody java.util.Map<String, Object> body) {
        Long institutionId = Long.valueOf(body.get("institutionId").toString());
        Long studentId = Long.valueOf(body.get("studentId").toString());
        Long invoiceId = body.get("invoiceId") != null ? Long.valueOf(body.get("invoiceId").toString()) : null;
        String description = (String) body.get("description");
        BigDecimal amount = new BigDecimal(body.get("amount").toString());
        return ResponseEntity.ok(accountsReceivableService.create(institutionId, studentId, invoiceId, description, amount));
    }

    @PostMapping("/{id}/payments")
    public ResponseEntity<AccountsReceivableResponse> addPayment(@PathVariable Long id, @RequestBody java.util.Map<String, Object> body) {
        BigDecimal amount = new BigDecimal(body.get("amount").toString());
        return ResponseEntity.ok(accountsReceivableService.addPayment(id, amount));
    }
}