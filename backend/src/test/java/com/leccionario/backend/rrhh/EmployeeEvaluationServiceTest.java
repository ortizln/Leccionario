package com.leccionario.backend.rrhh;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class EmployeeEvaluationServiceTest {

    private EmployeeEvaluationRepository repository;
    private EmployeeRepository employeeRepository;
    private EmployeeEvaluationService service;

    @BeforeEach
    void setUp() {
        repository = mock(EmployeeEvaluationRepository.class);
        employeeRepository = mock(EmployeeRepository.class);
        service = new EmployeeEvaluationService(repository, employeeRepository);
    }

    @Test
    void findAll_delegates() {
        when(repository.findByInstitutionIdOrderByEvaluationDateDesc(1L)).thenReturn(List.of());
        assertTrue(service.findAll(1L).isEmpty());
    }

    @Test
    void findByEmployee_delegates() {
        when(repository.findByEmployeeIdOrderByEvaluationDateDesc(1L)).thenReturn(List.of());
        assertTrue(service.findByEmployee(1L).isEmpty());
    }

    @Test
    void findByType_delegates() {
        when(repository.findByInstitutionIdAndEvaluationTypeOrderByEvaluationDateDesc(1L, "DOCENTE")).thenReturn(List.of());
        assertTrue(service.findByType(1L, "DOCENTE").isEmpty());
    }

    @Test
    void save_delegates() {
        EmployeeEvaluation eval = new EmployeeEvaluation();
        Employee emp = new Employee();
        emp.setId(1L);
        eval.setEmployee(emp);
        eval.setInstitutionId(1L);
        when(employeeRepository.findById(1L)).thenReturn(Optional.of(emp));
        when(repository.save(any())).thenAnswer(inv -> {
            EmployeeEvaluation e = inv.getArgument(0);
            e.setId(1L);
            return e;
        });
        var result = service.save(eval);
        assertNotNull(result);
        verify(repository).save(eval);
    }

    @Test
    void save_employeeNotFound_throws() {
        EmployeeEvaluation eval = new EmployeeEvaluation();
        Employee emp = new Employee();
        emp.setId(1L);
        eval.setEmployee(emp);
        when(employeeRepository.findById(1L)).thenReturn(Optional.empty());
        assertThrows(RuntimeException.class, () -> service.save(eval));
    }

    @Test
    void complete_setsScoreAndStatus() {
        EmployeeEvaluation eval = new EmployeeEvaluation();
        eval.setId(1L);
        eval.setStatus("PENDIENTE");
        when(repository.findById(1L)).thenReturn(Optional.of(eval));
        when(repository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        var result = service.complete(1L, new BigDecimal("4.5"), "Buen desempeno");
        assertEquals("COMPLETADA", result.getStatus());
        assertEquals(new BigDecimal("4.5"), result.getScore());
    }

    @Test
    void complete_notFound_throws() {
        when(repository.findById(1L)).thenReturn(Optional.empty());
        assertThrows(RuntimeException.class, () -> service.complete(1L, new BigDecimal("4.5"), "ok"));
    }

    @Test
    void delete_delegates() {
        service.delete(1L);
        verify(repository).deleteById(1L);
    }

    @Test
    void delete_notFound_alsoDelegates() {
        service.delete(999L);
        verify(repository).deleteById(999L);
    }
}
