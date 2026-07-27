package com.leccionario.backend.finance;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CreditNoteRepository extends JpaRepository<CreditNote, Long> {
    List<CreditNote> findByInstitutionIdOrderByNoteDateDesc(Long institutionId);
    List<CreditNote> findByInvoiceId(Long invoiceId);
    List<CreditNote> findByStudentIdOrderByNoteDateDesc(Long studentId);
}
