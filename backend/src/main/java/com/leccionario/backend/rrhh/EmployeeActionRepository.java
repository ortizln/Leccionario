package com.leccionario.backend.rrhh;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface EmployeeActionRepository extends JpaRepository<EmployeeAction, Long> {
    List<EmployeeAction> findByEmployeeIdOrderByActionDateDesc(Long employeeId);
    List<EmployeeAction> findByInstitutionIdOrderByActionDateDesc(Long institutionId);
}
