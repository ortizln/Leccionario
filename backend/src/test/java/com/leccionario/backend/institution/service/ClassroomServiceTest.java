package com.leccionario.backend.institution.service;

import com.leccionario.backend.institution.domain.Classroom;
import com.leccionario.backend.institution.repository.ClassroomRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ClassroomServiceTest {

    private ClassroomRepository repository;
    private ClassroomService service;

    @BeforeEach
    void setUp() {
        repository = mock(ClassroomRepository.class);
        service = new ClassroomService(repository);
    }

    @Test
    void create_savesAndReturns() {
        Classroom c = new Classroom();
        c.setCode("A-101");
        when(repository.save(c)).thenReturn(c);
        assertEquals("A-101", service.create(c).getCode());
    }

    @Test
    void findById_found() {
        Classroom c = new Classroom();
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
        Classroom existing = new Classroom();
        existing.setId(1L);
        existing.setCode("OLD");
        when(repository.findById(1L)).thenReturn(Optional.of(existing));
        when(repository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        Classroom updates = new Classroom();
        updates.setCode("NEW");
        Classroom result = service.update(1L, updates);
        assertEquals("NEW", result.getCode());
    }

    @Test
    void delete_delegatesToRepository() {
        service.delete(1L);
        verify(repository).deleteById(1L);
    }

    @Test
    void findByInstitution_delegatesToRepository() {
        when(repository.findByInstitutionIdAndActiveTrueOrderByName(1L)).thenReturn(List.of());
        assertTrue(service.findByInstitution(1L).isEmpty());
    }

    @Test
    void findByCampus_delegatesToRepository() {
        when(repository.findByCampusIdAndActiveTrueOrderByName(1L)).thenReturn(List.of());
        assertTrue(service.findByCampus(1L).isEmpty());
    }

    @Test
    void findByType_delegatesToRepository() {
        when(repository.findByClassroomTypeAndActiveTrue("AULA")).thenReturn(List.of());
        assertTrue(service.findByType("AULA").isEmpty());
    }
}
