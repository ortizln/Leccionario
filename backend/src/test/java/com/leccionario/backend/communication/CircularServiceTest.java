package com.leccionario.backend.communication;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class CircularServiceTest {

    private CircularRepository repository;
    private CircularService service;

    @BeforeEach
    void setUp() {
        repository = mock(CircularRepository.class);
        service = new CircularService(repository);
    }

    @Test
    void findAll_delegatesToRepository() {
        when(repository.findByInstitutionIdOrderByPublishDateDesc(1L)).thenReturn(List.of());
        assertTrue(service.findAll(1L).isEmpty());
    }

    @Test
    void findPublished_filtersByStatus() {
        when(repository.findByInstitutionIdAndStatusOrderByPublishDateDesc(1L, "PUBLICADA")).thenReturn(List.of());
        assertTrue(service.findPublished(1L).isEmpty());
    }

    @Test
    void findByCategory_delegatesToRepository() {
        when(repository.findByInstitutionIdAndCategoryOrderByPublishDateDesc(1L, "ACADEMICA")).thenReturn(List.of());
        assertTrue(service.findByCategory(1L, "ACADEMICA").isEmpty());
    }

    @Test
    void save_delegatesToRepository() {
        Circular c = new Circular();
        when(repository.save(c)).thenReturn(c);
        assertNotNull(service.save(c));
    }

    @Test
    void delete_delegatesToRepository() {
        service.delete(1L);
        verify(repository).deleteById(1L);
    }
}
