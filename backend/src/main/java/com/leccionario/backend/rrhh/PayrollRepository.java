package com.leccionario.backend.rrhh;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PayrollRepository extends JpaRepository<Payroll, Long> {
    List<Payroll> findByInstitutionIdOrderByCreatedAtDesc(Long institutionId);
    List<Payroll> findByInstitutionIdAndStatusOrderByCreatedAtDesc(Long institutionId, String status);
}
