package com.leccionario.backend.finance;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.List;

@Service
public class AccountsReceivableService {

    private final AccountsReceivableRepository accountsReceivableRepository;

    public AccountsReceivableService(AccountsReceivableRepository accountsReceivableRepository) {
        this.accountsReceivableRepository = accountsReceivableRepository;
    }

    public List<AccountsReceivableResponse> findPending(Long institutionId) {
        return accountsReceivableRepository.findByInstitutionIdAndStatusOrderByDueDateDesc(institutionId, "PENDIENTE").stream()
                .map(this::toResponse).toList();
    }

    public List<AccountsReceivableResponse> findByStudent(Long studentId) {
        return accountsReceivableRepository.findByStudentIdOrderByDueDateDesc(studentId).stream()
                .map(this::toResponse).toList();
    }

    @Transactional
    public AccountsReceivableResponse create(Long institutionId, Long studentId, Long invoiceId, String description, BigDecimal amount) {
        AccountsReceivable ar = new AccountsReceivable();
        ar.setInstitutionId(institutionId);
        ar.setStudentId(studentId);
        ar.setInvoiceId(invoiceId);
        ar.setDescription(description);
        ar.setOriginalAmount(amount);
        ar.setStatus("PENDIENTE");
        return toResponse(accountsReceivableRepository.save(ar));
    }

    @Transactional
    public AccountsReceivableResponse addPayment(Long id, BigDecimal amount) {
        AccountsReceivable ar = accountsReceivableRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Accounts receivable not found"));
        BigDecimal newPaid = ar.getPaidAmount().add(amount);
        ar.setPaidAmount(newPaid);
        if (newPaid.compareTo(ar.getOriginalAmount()) >= 0) {
            ar.setStatus("PAGADO");
        } else {
            ar.setStatus("PARCIAL");
        }
        return toResponse(accountsReceivableRepository.save(ar));
    }

    private AccountsReceivableResponse toResponse(AccountsReceivable ar) {
        AccountsReceivableResponse resp = new AccountsReceivableResponse();
        resp.id = ar.getId();
        resp.institutionId = ar.getInstitutionId();
        resp.studentId = ar.getStudentId();
        resp.invoiceId = ar.getInvoiceId();
        resp.description = ar.getDescription();
        resp.originalAmount = ar.getOriginalAmount();
        resp.paidAmount = ar.getPaidAmount();
        resp.dueDate = ar.getDueDate();
        resp.status = ar.getStatus();
        return resp;
    }
}
