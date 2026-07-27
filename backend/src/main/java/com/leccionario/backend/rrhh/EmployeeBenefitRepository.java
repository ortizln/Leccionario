package com.leccionario.backend.rrhh;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface EmployeeBenefitRepository extends JpaRepository<EmployeeBenefit, Long> {
    List<EmployeeBenefit> findByEmployeeIdAndIsActiveTrue(Long employeeId);
    List<EmployeeBenefit> findByInstitutionId(Long institutionId);
}
