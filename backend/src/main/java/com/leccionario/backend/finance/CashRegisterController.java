package com.leccionario.backend.finance;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/finance/cash-registers")
@CrossOrigin(origins = "*")
public class CashRegisterController {

    private final CashRegisterService cashRegisterService;

    public CashRegisterController(CashRegisterService cashRegisterService) {
        this.cashRegisterService = cashRegisterService;
    }

    @GetMapping
    public ResponseEntity<List<CashRegisterResponse>> findAll(@RequestParam Long institutionId) {
        return ResponseEntity.ok(cashRegisterService.findAll(institutionId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CashRegisterResponse> findById(@PathVariable Long id) {
        return ResponseEntity.ok(cashRegisterService.findById(id));
    }

    @GetMapping("/open")
    public ResponseEntity<CashRegisterResponse> findOpen(@RequestParam Long institutionId) {
        return ResponseEntity.ok(cashRegisterService.findOpenRegister(institutionId, java.time.LocalDate.now()));
    }

    @PostMapping
    public ResponseEntity<CashRegisterResponse> open(@RequestBody CashRegisterRequest req) {
        return ResponseEntity.ok(cashRegisterService.open(req));
    }

    @PostMapping("/{id}/close")
    public ResponseEntity<CashRegisterResponse> close(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        String closedBy = (String) body.get("closedBy");
        BigDecimal closingBalance = new BigDecimal(body.get("closingBalance").toString());
        return ResponseEntity.ok(cashRegisterService.close(id, closedBy, closingBalance));
    }

    @PostMapping("/transactions")
    public ResponseEntity<CashTransactionResponse> addTransaction(@RequestBody CashTransactionRequest req) {
        return ResponseEntity.ok(cashRegisterService.addTransaction(req));
    }

    @GetMapping("/{id}/transactions")
    public ResponseEntity<List<CashTransactionResponse>> getTransactions(@PathVariable Long id) {
        return ResponseEntity.ok(cashRegisterService.getTransactions(id));
    }

    @GetMapping("/collection-methods")
    public ResponseEntity<List<Map<String, Object>>> getCollectionMethods(@RequestParam Long institutionId) {
        return ResponseEntity.ok(cashRegisterService.getCollectionMethods(institutionId));
    }

    @GetMapping(value = "/{id}/daily-close", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]> getDailyClosePdf(@PathVariable Long id) {
        byte[] pdf = cashRegisterService.getDailyClosePdf(id);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=cierre_caja_" + id + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }
}
