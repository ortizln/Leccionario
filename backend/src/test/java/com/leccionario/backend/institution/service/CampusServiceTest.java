package com.leccionario.backend.institution.service;

import com.leccionario.backend.institution.domain.Campus;
import com.leccionario.backend.institution.repository.CampusRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class CampusServiceTest {

    private CampusRepository repository;
    private CampusService service;

    @BeforeEach
    void setUp() {
        repository = mock(CampusRepository.class);
        service = new CampusService(repository);
    }

    @Test
    void create_savesAndReturns() {
        Campus c = new Campus();
        c.setName("Sede Norte");
        when(repository.save(c)).thenReturn(c);
        assertEquals("Sede Norte", service.create(c).getName());
    }

    @Test
    void findById_found() {
        Campus c = new Campus();
        c.setId(1L);
        when(repository.findById(1L)).thenReturn(Optional.of(c));
        assertEquals(1L, service.findById(1L).getId());
    }

    @Test
    void findById_notFound_throws() {
        when(repository.findById(1L)).thenReturn(Optional.empty());
        assertThrows(RuntimeException.class, () -> service.findById(1L));
    }

    @Test
    void update_found() {
        Campus existing = new Campus();
        existing.setId(1L);
        existing.setName("Old");
        when(repository.findById(1L)).thenReturn(Optional.of(existing));
        when(repository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        Campus updates = new Campus();
        updates.setName("New");
        Campus result = service.update(1L, updates);
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
