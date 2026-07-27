package com.leccionario.backend.rrhh;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PayrollEntryRepository extends JpaRepository<PayrollEntry, Long> {
    List<PayrollEntry> findByPayrollId(Long payrollId);
    List<PayrollEntry> findByEmployeeIdOrderByCreatedAtDesc(Long employeeId);
}
