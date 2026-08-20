package com.leccionario.backend.finance;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    List<Invoice> findByInstitutionIdOrderByInvoiceDateDesc(Long institutionId);
    Page<Invoice> findByInstitutionId(Long institutionId, Pageable pageable);
    List<Invoice> findByInstitutionIdAndStatusOrderByInvoiceDateDesc(Long institutionId, String status);
    List<Invoice> findByStudentIdOrderByInvoiceDateDesc(Long studentId);
    List<Invoice> findByStudentIdAndPeriodIdOrderByInvoiceDateDesc(Long studentId, Long periodId);
    Optional<Invoice> findByInstitutionIdAndInvoiceNumber(Long institutionId, String invoiceNumber);
    List<Invoice> findByStatusAndDueDateBefore(String status, LocalDate date);
}
