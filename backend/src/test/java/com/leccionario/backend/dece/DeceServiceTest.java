package com.leccionario.backend.dece;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class DeceServiceTest {

    private DeceCaseRepository deceCaseRepository;
    private DeceService service;

    @BeforeEach
    void setUp() {
        deceCaseRepository = mock(DeceCaseRepository.class);
        service = new DeceService(deceCaseRepository, null);
    }

    @Test
    void findById_found() {
        DeceCase c = new DeceCase();
        c.setId(1L);
        when(deceCaseRepository.findById(1L)).thenReturn(Optional.of(c));
        assertNotNull(service.findById(1L));
    }

    @Test
    void findById_notFound_throws() {
        when(deceCaseRepository.findById(1L)).thenReturn(Optional.empty());
        assertThrows(RuntimeException.class, () -> service.findById(1L));
    }

    @Test
    void delete_delegatesToRepository() {
        service.delete(1L);
        verify(deceCaseRepository).deleteById(1L);
    }

    @Test
    void findByStudent_delegatesToRepository() {
        when(deceCaseRepository.findByStudentIdOrderByOpenDateDesc(1L)).thenReturn(List.of());
        assertTrue(service.findByStudent(1L).isEmpty());
    }

    @Test
    void findOpen_delegatesToRepository() {
        when(deceCaseRepository.findByStatusOrderByOpenDateDesc("ABIERTO")).thenReturn(List.of());
        assertTrue(service.findOpen().isEmpty());
    }

    @Test
    void findByType_filtersByCaseType() {
        when(deceCaseRepository.findByCaseTypeAndStatus("ACADEMICO", "ABIERTO")).thenReturn(List.of());
        assertTrue(service.findByType("ACADEMICO").isEmpty());
    }
}
