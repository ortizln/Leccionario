package com.leccionario.backend.rrhh;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class EmployeeActionServiceTest {

    private EmployeeActionRepository repo;
    private EmployeeActionService service;

    @BeforeEach
    void setUp() {
        repo = mock(EmployeeActionRepository.class);
        service = new EmployeeActionService(repo);
    }

    @Test
    void findByEmployee_delegatesToRepository() {
        when(repo.findByEmployeeIdOrderByActionDateDesc(1L)).thenReturn(List.of());
        assertTrue(service.findByEmployee(1L).isEmpty());
    }

    @Test
    void findAll_delegatesToRepository() {
        when(repo.findByInstitutionIdOrderByActionDateDesc(1L)).thenReturn(List.of());
        assertTrue(service.findAll(1L).isEmpty());
    }

    @Test
    void save_savesAndReturns() {
        EmployeeAction a = new EmployeeAction();
        a.setEmployeeId(1L);
        when(repo.save(a)).thenReturn(a);
        assertNotNull(service.save(a));
    }

    @Test
    void delete_delegatesToRepository() {
        service.delete(1L);
        verify(repo).deleteById(1L);
    }
}
