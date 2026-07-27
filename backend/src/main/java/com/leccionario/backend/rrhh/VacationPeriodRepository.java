package com.leccionario.backend.rrhh;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface VacationPeriodRepository extends JpaRepository<VacationPeriod, Long> {
    List<VacationPeriod> findByEmployeeIdOrderByYearDesc(Long employeeId);
    Optional<VacationPeriod> findByEmployeeIdAndYear(Long employeeId, Integer year);
}
