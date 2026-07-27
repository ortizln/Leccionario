package com.leccionario.backend.rrhh;

import com.leccionario.backend.common.exception.ResourceNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class EmployeeServiceTest {

    private EmployeeRepository repository;
    private EmployeeService service;

    @BeforeEach
    void setUp() {
        repository = mock(EmployeeRepository.class);
        service = new EmployeeService(repository);
    }

    @Test
    void create_savesAndReturns() {
        Employee emp = new Employee();
        emp.setFirstName("Juan");
        when(repository.save(emp)).thenReturn(emp);
        Employee result = service.create(emp);
        assertNotNull(result);
        assertEquals("Juan", result.getFirstName());
    }

    @Test
    void findById_found() {
        Employee emp = new Employee();
        emp.setId(1L);
        when(repository.findById(1L)).thenReturn(Optional.of(emp));
        assertEquals(1L, service.findById(1L).getId());
    }

    @Test
    void findById_notFound_throws() {
        when(repository.findById(1L)).thenReturn(Optional.empty());
        assertThrows(RuntimeException.class, () -> service.findById(1L));
    }

    @Test
    void update_found() {
        Employee existing = new Employee();
        existing.setId(1L);
        existing.setFirstName("Old");
        when(repository.findById(1L)).thenReturn(Optional.of(existing));
        when(repository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        Employee updates = new Employee();
        updates.setFirstName("New");
        updates.setLastName("L");
        updates.setPosition("Dev");

        Employee result = service.update(1L, updates);
        assertEquals("New", result.getFirstName());
        assertEquals("L", result.getLastName());
    }

    @Test
    void update_notFound_throws() {
        when(repository.findById(1L)).thenReturn(Optional.empty());
        assertThrows(RuntimeException.class, () -> service.update(1L, new Employee()));
    }

    @Test
    void delete_delegatesToRepository() {
        service.delete(1L);
        verify(repository).deleteById(1L);
    }

    @Test
    void findByInstitution_delegatesToRepository() {
        when(repository.findByInstitutionId(1L)).thenReturn(List.of());
        assertTrue(service.findByInstitution(1L).isEmpty());
    }

    @Test
    void findActiveByInstitution_filtersByStatus() {
        when(repository.findByInstitutionIdAndStatus(1L, "ACTIVO")).thenReturn(List.of());
        assertTrue(service.findActiveByInstitution(1L).isEmpty());
    }

    @Test
    void getStats_returnsMap() {
        Employee emp = new Employee();
        emp.setStatus("ACTIVO");
        when(repository.findByInstitutionId(1L)).thenReturn(List.of(emp));
        when(repository.countActiveByInstitution(1L)).thenReturn(1L);

        Map<String, Object> stats = service.getStats(1L);
        assertEquals(1L, stats.get("total"));
        assertEquals(1L, stats.get("active"));
    }
}
