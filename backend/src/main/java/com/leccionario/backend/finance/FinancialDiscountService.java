package com.leccionario.backend.finance;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class FinancialDiscountService {
    private final FinancialDiscountRepository repository;

    public FinancialDiscountService(FinancialDiscountRepository repository) {
        this.repository = repository;
    }

    public List<FinancialDiscount> findAll(Long institutionId) {
        return repository.findByInstitutionIdOrderByCreatedAtDesc(institutionId);
    }

    public List<FinancialDiscount> findActive(Long institutionId) {
        return repository.findByInstitutionIdAndStatusOrderByCreatedAtDesc(institutionId, "ACTIVO");
    }

    public List<FinancialDiscount> findByStudent(Long studentId) {
        return repository.findByStudentIdOrderByCreatedAtDesc(studentId);
    }

    @Transactional
    public FinancialDiscount save(FinancialDiscount discount) {
        return repository.save(discount);
    }

    @Transactional
    public void delete(Long id) {
        repository.deleteById(id);
    }
}
