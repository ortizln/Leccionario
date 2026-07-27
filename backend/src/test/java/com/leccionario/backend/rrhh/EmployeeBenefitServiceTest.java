package com.leccionario.backend.rrhh;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class EmployeeBenefitServiceTest {

    private EmployeeBenefitRepository repo;
    private EmployeeBenefitService service;

    @BeforeEach
    void setUp() {
        repo = mock(EmployeeBenefitRepository.class);
        service = new EmployeeBenefitService(repo);
    }

    @Test
    void findByEmployee_filtersActive() {
        when(repo.findByEmployeeIdAndIsActiveTrue(1L)).thenReturn(List.of());
        assertTrue(service.findByEmployee(1L).isEmpty());
    }

    @Test
    void findAll_delegatesToRepository() {
        when(repo.findByInstitutionId(1L)).thenReturn(List.of());
        assertTrue(service.findAll(1L).isEmpty());
    }

    @Test
    void save_savesAndReturns() {
        EmployeeBenefit b = new EmployeeBenefit();
        b.setEmployeeId(1L);
        when(repo.save(b)).thenReturn(b);
        assertNotNull(service.save(b));
    }

    @Test
    void delete_delegatesToRepository() {
        service.delete(1L);
        verify(repo).deleteById(1L);
    }
}
