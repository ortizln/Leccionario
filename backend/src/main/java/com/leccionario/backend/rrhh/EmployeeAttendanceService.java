package com.leccionario.backend.rrhh;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.List;

@Service
public class EmployeeAttendanceService {
    private final EmployeeAttendanceRepository repository;
    private final EmployeeRepository employeeRepository;

    public EmployeeAttendanceService(EmployeeAttendanceRepository repository, EmployeeRepository employeeRepository) {
        this.repository = repository;
        this.employeeRepository = employeeRepository;
    }

    public List<EmployeeAttendance> findAll(Long institutionId) {
        return repository.findByInstitutionIdAndAttendanceDateOrderByAttendanceDateAsc(institutionId, LocalDate.now());
    }

    public List<EmployeeAttendance> findByEmployee(Long employeeId, Long institutionId) {
        return repository.findByEmployeeIdAndInstitutionIdOrderByAttendanceDateDesc(employeeId, institutionId);
    }

    public List<EmployeeAttendance> findByDateRange(Long institutionId, LocalDate from, LocalDate to) {
        return repository.findByInstitutionIdAndAttendanceDateBetweenOrderByAttendanceDateAsc(institutionId, from, to);
    }

    @Transactional
    public EmployeeAttendance checkIn(Long employeeId, Long institutionId) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Empleado no encontrado"));
        EmployeeAttendance att = EmployeeAttendance.builder()
                .employee(employee)
                .attendanceDate(LocalDate.now())
                .checkInTime(java.time.LocalTime.now())
                .status("PRESENTE")
                .institutionId(institutionId)
                .build();
        return repository.save(att);
    }

    @Transactional
    public EmployeeAttendance checkOut(Long id) {
        EmployeeAttendance att = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Registro no encontrado"));
        att.setCheckOutTime(java.time.LocalTime.now());
        return repository.save(att);
    }

    @Transactional
    public EmployeeAttendance save(EmployeeAttendance att) {
        return repository.save(att);
    }

    public java.util.Map<String, Object> getStats(Long institutionId) {
        LocalDate today = LocalDate.now();
        java.util.Map<String, Object> stats = new java.util.LinkedHashMap<>();
        stats.put("present", repository.countByInstitutionIdAndStatusAndAttendanceDate(institutionId, "PRESENTE", today));
        stats.put("absent", repository.countByInstitutionIdAndStatusAndAttendanceDate(institutionId, "AUSENTE", today));
        stats.put("late", repository.countByInstitutionIdAndStatusAndAttendanceDate(institutionId, "TARDANZA", today));
        stats.put("permission", repository.countByInstitutionIdAndStatusAndAttendanceDate(institutionId, "PERMISO", today));
        return stats;
    }
}
