package com.leccionario.backend.rrhh;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class TrainingContentServiceTest {

    private TrainingContentRepository repo;
    private TrainingContentService service;

    @BeforeEach
    void setUp() {
        repo = mock(TrainingContentRepository.class);
        service = new TrainingContentService(repo);
    }

    @Test
    void findByCourse_delegatesToRepository() {
        when(repo.findByCourseIdOrderBySortOrderAsc(1L)).thenReturn(List.of());
        assertTrue(service.findByCourse(1L).isEmpty());
    }

    @Test
    void save_savesAndReturns() {
        TrainingContent c = new TrainingContent();
        c.setCourseId(1L);
        when(repo.save(c)).thenReturn(c);
        assertNotNull(service.save(c));
    }

    @Test
    void delete_delegatesToRepository() {
        service.delete(1L);
        verify(repo).deleteById(1L);
    }
}
