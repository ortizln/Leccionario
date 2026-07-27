package com.leccionario.backend.finance;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/finance/invoices")
@CrossOrigin(origins = "*")
public class InvoiceController {

    private final InvoiceService invoiceService;
    private final CreditNoteService creditNoteService;

    public InvoiceController(InvoiceService invoiceService, CreditNoteService creditNoteService) {
        this.invoiceService = invoiceService;
        this.creditNoteService = creditNoteService;
    }

    @GetMapping
    public ResponseEntity<List<InvoiceResponse>> findAll(@RequestParam Long institutionId) {
        return ResponseEntity.ok(invoiceService.findAll(institutionId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<InvoiceResponse> findById(@PathVariable Long id) {
        return ResponseEntity.ok(invoiceService.findById(id));
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<InvoiceResponse>> findByStudent(@PathVariable Long studentId) {
        return ResponseEntity.ok(invoiceService.findByStudent(studentId));
    }

    @PostMapping
    public ResponseEntity<InvoiceResponse> create(@RequestBody InvoiceRequest req) {
        return ResponseEntity.ok(invoiceService.create(req));
    }

    @PostMapping("/{id}/payments")
    public ResponseEntity<InvoiceResponse> addPayment(@PathVariable Long id, @RequestBody java.util.Map<String, Object> body) {
        BigDecimal amount = new BigDecimal(body.get("amount").toString());
        String paymentMethod = (String) body.getOrDefault("paymentMethod", "EFECTIVO");
        return ResponseEntity.ok(invoiceService.addPayment(id, amount, paymentMethod));
    }

    @GetMapping("/overdue")
    public ResponseEntity<List<InvoiceResponse>> findOverdue() {
        return ResponseEntity.ok(invoiceService.findOverdue());
    }

    @GetMapping("/credit-notes")
    public ResponseEntity<List<CreditNoteResponse>> findCreditNotes(@RequestParam Long institutionId) {
        return ResponseEntity.ok(creditNoteService.findAll(institutionId));
    }

    @PostMapping("/credit-notes")
    public ResponseEntity<CreditNoteResponse> createCreditNote(@RequestBody java.util.Map<String, Object> body) {
        Long invoiceId = Long.valueOf(body.get("invoiceId").toString());
        Long studentId = Long.valueOf(body.get("studentId").toString());
        Long institutionId = Long.valueOf(body.get("institutionId").toString());
        java.math.BigDecimal amount = new java.math.BigDecimal(body.get("amount").toString());
        String reason = (String) body.get("reason");
        return ResponseEntity.ok(creditNoteService.create(invoiceId, studentId, institutionId, amount, reason));
    }

    @GetMapping(value = "/student/{studentId}/statement", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]> getAccountStatement(@PathVariable Long studentId, @RequestParam Long institutionId) {
        byte[] pdf = invoiceService.getAccountStatementPdf(studentId, institutionId);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=estado_cuenta_" + studentId + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    @GetMapping(value = "/{id}/pdf", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]> getInvoicePdf(@PathVariable Long id) {
        byte[] pdf = invoiceService.getInvoicePdf(id);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=factura_" + id + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    @PostMapping("/{id}/payments/pdf")
    public ResponseEntity<byte[]> addPaymentAndReceipt(@PathVariable Long id, @RequestBody java.util.Map<String, Object> body) {
        java.math.BigDecimal amount = new java.math.BigDecimal(body.get("amount").toString());
        String paymentMethod = (String) body.getOrDefault("paymentMethod", "EFECTIVO");
        invoiceService.addPayment(id, amount, paymentMethod);
        byte[] pdf = invoiceService.getPaymentReceiptPdf(id, amount, paymentMethod);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=comprobante_pago_" + id + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }
}
