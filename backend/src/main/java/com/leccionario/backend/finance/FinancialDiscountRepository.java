package com.leccionario.backend.finance;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface FinancialDiscountRepository extends JpaRepository<FinancialDiscount, Long> {
    List<FinancialDiscount> findByInstitutionIdAndStatusOrderByCreatedAtDesc(Long institutionId, String status);
    List<FinancialDiscount> findByStudentIdOrderByCreatedAtDesc(Long studentId);
    List<FinancialDiscount> findByInstitutionIdOrderByCreatedAtDesc(Long institutionId);
}
