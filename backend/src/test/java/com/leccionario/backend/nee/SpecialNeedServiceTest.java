package com.leccionario.backend.nee;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class SpecialNeedServiceTest {

    private SpecialNeedRepository repository;
    private SpecialNeedService service;

    @BeforeEach
    void setUp() {
        repository = mock(SpecialNeedRepository.class);
        service = new SpecialNeedService(repository);
    }

    @Test
    void findById_found() {
        SpecialNeed sn = new SpecialNeed();
        sn.setId(1L);
        when(repository.findById(1L)).thenReturn(Optional.of(sn));
        assertNotNull(service.findById(1L));
    }

    @Test
    void findById_notFound_throws() {
        when(repository.findById(1L)).thenReturn(Optional.empty());
        assertThrows(RuntimeException.class, () -> service.findById(1L));
    }

    @Test
    void delete_delegatesToRepository() {
        service.delete(1L);
        verify(repository).deleteById(1L);
    }

    @Test
    void findByStudent_delegatesToRepository() {
        when(repository.findByStudentIdOrderByCreatedAtDesc(1L)).thenReturn(List.of());
        assertTrue(service.findByStudent(1L).isEmpty());
    }

    @Test
    void findAllActive_filtersByStatus() {
        when(repository.findByStatusOrderByDiagnosisDesc("ACTIVO")).thenReturn(List.of());
        assertTrue(service.findAllActive().isEmpty());
    }

    @Test
    void findByType_filtersByTypeAndStatus() {
        when(repository.findByNeedTypeAndStatus("DISCAPACIDAD", "ACTIVO")).thenReturn(List.of());
        assertTrue(service.findByType("DISCAPACIDAD").isEmpty());
    }
}
