package com.leccionario.backend.rrhh;

import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;

public interface EmployeeAttendanceRepository extends JpaRepository<EmployeeAttendance, Long> {
    List<EmployeeAttendance> findByEmployeeIdAndInstitutionIdOrderByAttendanceDateDesc(Long employeeId, Long institutionId);
    List<EmployeeAttendance> findByInstitutionIdAndAttendanceDateOrderByAttendanceDateAsc(Long institutionId, LocalDate date);
    List<EmployeeAttendance> findByInstitutionIdAndAttendanceDateBetweenOrderByAttendanceDateAsc(Long institutionId, LocalDate from, LocalDate to);
    long countByInstitutionIdAndStatusAndAttendanceDate(Long institutionId, String status, LocalDate date);
}
