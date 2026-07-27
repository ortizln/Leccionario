package com.leccionario.backend.rrhh;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface EmploymentContractRepository extends JpaRepository<EmploymentContract, Long> {
    List<EmploymentContract> findByEmployeeIdOrderByStartDateDesc(Long employeeId);
    Optional<EmploymentContract> findByEmployeeIdAndStatus(Long employeeId, String status);
    List<EmploymentContract> findByStatus(String status);
}
