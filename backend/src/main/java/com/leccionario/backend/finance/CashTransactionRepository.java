package com.leccionario.backend.finance;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Map;

public interface CashTransactionRepository extends JpaRepository<CashTransaction, Long> {
    List<CashTransaction> findByRegisterIdOrderByCreatedAtDesc(Long registerId);
    List<CashTransaction> findByStudentIdOrderByCreatedAtDesc(Long studentId);
    List<CashTransaction> findByInvoiceId(Long invoiceId);

    @Query("SELECT t.paymentMethod as method, COUNT(t) as count, COALESCE(SUM(t.amount),0) as total FROM CashTransaction t WHERE t.registerId IN (SELECT r.id FROM CashRegister r WHERE r.institutionId = :institutionId) GROUP BY t.paymentMethod ORDER BY SUM(t.amount) DESC")
    List<Map<String, Object>> getCollectionMethodsByInstitution(@Param("institutionId") Long institutionId);
}
