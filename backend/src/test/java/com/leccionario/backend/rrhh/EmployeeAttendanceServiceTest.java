package com.leccionario.backend.rrhh;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class EmployeeAttendanceServiceTest {

    private EmployeeAttendanceRepository repository;
    private EmployeeRepository employeeRepository;
    private EmployeeAttendanceService service;

    @BeforeEach
    void setUp() {
        repository = mock(EmployeeAttendanceRepository.class);
        employeeRepository = mock(EmployeeRepository.class);
        service = new EmployeeAttendanceService(repository, employeeRepository);
    }

    @Test
    void findAll_delegatesToRepository() {
        when(repository.findByInstitutionIdAndAttendanceDateOrderByAttendanceDateAsc(1L, LocalDate.now())).thenReturn(List.of());
        assertTrue(service.findAll(1L).isEmpty());
    }

    @Test
    void findByEmployee_delegatesToRepository() {
        when(repository.findByEmployeeIdAndInstitutionIdOrderByAttendanceDateDesc(1L, 1L)).thenReturn(List.of());
        assertTrue(service.findByEmployee(1L, 1L).isEmpty());
    }

    @Test
    void findByDateRange_delegatesToRepository() {
        LocalDate from = LocalDate.now().minusDays(7);
        LocalDate to = LocalDate.now();
        when(repository.findByInstitutionIdAndAttendanceDateBetweenOrderByAttendanceDateAsc(1L, from, to)).thenReturn(List.of());
        assertTrue(service.findByDateRange(1L, from, to).isEmpty());
    }

    @Test
    void checkIn_savesNewAttendance() {
        Employee employee = new Employee();
        employee.setId(1L);
        when(employeeRepository.findById(1L)).thenReturn(Optional.of(employee));
        when(repository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        EmployeeAttendance result = service.checkIn(1L, 1L);
        assertNotNull(result);
        assertEquals("PRESENTE", result.getStatus());
        assertNotNull(result.getCheckInTime());
    }

    @Test
    void checkIn_employeeNotFound_throws() {
        when(employeeRepository.findById(1L)).thenReturn(Optional.empty());
        assertThrows(RuntimeException.class, () -> service.checkIn(1L, 1L));
    }

    @Test
    void checkOut_setsCheckOutTime() {
        EmployeeAttendance att = EmployeeAttendance.builder().checkOutTime(null).build();
        att.setId(1L);
        when(repository.findById(1L)).thenReturn(Optional.of(att));
        when(repository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        EmployeeAttendance result = service.checkOut(1L);
        assertNotNull(result.getCheckOutTime());
    }

    @Test
    void checkOut_notFound_throws() {
        when(repository.findById(1L)).thenReturn(Optional.empty());
        assertThrows(RuntimeException.class, () -> service.checkOut(1L));
    }

    @Test
    void save_delegatesToRepository() {
        EmployeeAttendance att = new EmployeeAttendance();
        when(repository.save(att)).thenReturn(att);
        assertNotNull(service.save(att));
    }
}
