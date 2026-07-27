package com.leccionario.backend.finance;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class CreditNoteService {

    private final CreditNoteRepository creditNoteRepository;
    private final InvoiceRepository invoiceRepository;

    public CreditNoteService(CreditNoteRepository creditNoteRepository, InvoiceRepository invoiceRepository) {
        this.creditNoteRepository = creditNoteRepository;
        this.invoiceRepository = invoiceRepository;
    }

    public List<CreditNoteResponse> findAll(Long institutionId) {
        return creditNoteRepository.findByInstitutionIdOrderByNoteDateDesc(institutionId).stream()
                .map(this::toResponse).toList();
    }

    public CreditNoteResponse findById(Long id) {
        CreditNote cn = creditNoteRepository.findById(id).orElseThrow(() -> new RuntimeException("Credit note not found"));
        return toResponse(cn);
    }

    @Transactional
    public CreditNoteResponse create(Long invoiceId, Long studentId, Long institutionId, java.math.BigDecimal amount, String reason) {
        Invoice inv = invoiceRepository.findById(invoiceId).orElseThrow(() -> new RuntimeException("Invoice not found"));
        long count = creditNoteRepository.findByInstitutionIdOrderByNoteDateDesc(institutionId).size();
        CreditNote cn = new CreditNote();
        cn.setInstitutionId(institutionId);
        cn.setInvoiceId(invoiceId);
        cn.setStudentId(studentId);
        cn.setAmount(amount);
        cn.setReason(reason);
        cn.setNoteNumber(String.format("NC-%05d", count + 1));
        creditNoteRepository.save(cn);
        java.math.BigDecimal newPaid = inv.getPaidAmount().add(amount);
        inv.setPaidAmount(newPaid);
        if (newPaid.compareTo(inv.getTotal()) >= 0) inv.setStatus("PAGADA");
        else if (newPaid.compareTo(java.math.BigDecimal.ZERO) > 0) inv.setStatus("PARCIAL");
        invoiceRepository.save(inv);
        return toResponse(cn);
    }

    private CreditNoteResponse toResponse(CreditNote cn) {
        CreditNoteResponse resp = new CreditNoteResponse();
        resp.id = cn.getId();
        resp.institutionId = cn.getInstitutionId();
        resp.noteNumber = cn.getNoteNumber();
        resp.invoiceId = cn.getInvoiceId();
        resp.studentId = cn.getStudentId();
        resp.noteDate = cn.getNoteDate();
        resp.amount = cn.getAmount();
        resp.reason = cn.getReason();
        resp.status = cn.getStatus();
        resp.observations = cn.getObservations();
        return resp;
    }

    @Transactional
    public CreditNoteResponse apply(Long id) {
        CreditNote cn = creditNoteRepository.findById(id).orElseThrow(() -> new RuntimeException("Credit note not found"));
        if (!"PENDING".equals(cn.getStatus())) throw new RuntimeException("Credit note is not pending");
        cn.setStatus("APPLIED");
        creditNoteRepository.save(cn);
        return toResponse(cn);
    }

    @Transactional
    public CreditNoteResponse cancel(Long id) {
        CreditNote cn = creditNoteRepository.findById(id).orElseThrow(() -> new RuntimeException("Credit note not found"));
        if (!"PENDING".equals(cn.getStatus())) throw new RuntimeException("Credit note is not pending");
        cn.setStatus("CANCELLED");
        creditNoteRepository.save(cn);
        Invoice inv = invoiceRepository.findById(cn.getInvoiceId()).orElseThrow(() -> new RuntimeException("Invoice not found"));
        java.math.BigDecimal newPaid = inv.getPaidAmount().subtract(cn.getAmount());
        inv.setPaidAmount(newPaid);
        if (newPaid.compareTo(java.math.BigDecimal.ZERO) <= 0) inv.setStatus("PENDIENTE");
        else inv.setStatus("PARCIAL");
        invoiceRepository.save(inv);
        return toResponse(cn);
    }
}
