package com.leccionario.backend.institution.service;

import com.leccionario.backend.institution.domain.Shift;
import com.leccionario.backend.institution.repository.ShiftRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ShiftServiceTest {

    private ShiftRepository repository;
    private ShiftService service;

    @BeforeEach
    void setUp() {
        repository = mock(ShiftRepository.class);
        service = new ShiftService(repository);
    }

    @Test
    void create_savesAndReturns() {
        Shift s = new Shift();
        s.setName("Matutino");
        when(repository.save(s)).thenReturn(s);
        assertEquals("Matutino", service.create(s).getName());
    }

    @Test
    void findById_found() {
        Shift s = new Shift();
        s.setId(1L);
        when(repository.findById(1L)).thenReturn(Optional.of(s));
        assertEquals(1L, service.findById(1L).getId());
    }

    @Test
    void findById_notFound_throws() {
        when(repository.findById(1L)).thenReturn(Optional.empty());
        assertThrows(RuntimeException.class, () -> service.findById(1L));
    }

    @Test
    void update_found() {
        Shift existing = new Shift();
        existing.setId(1L);
        existing.setName("Old");
        when(repository.findById(1L)).thenReturn(Optional.of(existing));
        when(repository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        Shift updates = new Shift();
        updates.setName("New");
        Shift result = service.update(1L, updates);
        assertEquals("New", result.getName());
    }

    @Test
    void delete_delegatesToRepository() {
        service.delete(1L);
        verify(repository).deleteById(1L);
    }

    @Test
    void findByInstitution_delegatesToRepository() {
        when(repository.findByInstitutionIdOrderByName(1L)).thenReturn(List.of());
        assertTrue(service.findByInstitution(1L).isEmpty());
    }

    @Test
    void findActiveByInstitution_delegatesToRepository() {
        when(repository.findByInstitutionIdAndActiveTrueOrderByName(1L)).thenReturn(List.of());
        assertTrue(service.findActiveByInstitution(1L).isEmpty());
    }
}
