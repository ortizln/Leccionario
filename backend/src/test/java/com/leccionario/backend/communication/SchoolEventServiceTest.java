package com.leccionario.backend.communication;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class SchoolEventServiceTest {

    private SchoolEventRepository repository;
    private SchoolEventService service;

    @BeforeEach
    void setUp() {
        repository = mock(SchoolEventRepository.class);
        service = new SchoolEventService(repository);
    }

    @Test
    void findAll_delegatesToRepository() {
        when(repository.findByInstitutionIdOrderByEventDateDesc(1L)).thenReturn(List.of());
        assertTrue(service.findAll(1L).isEmpty());
    }

    @Test
    void findUpcoming_usesAfterDate() {
        when(repository.findByInstitutionIdAndEventDateAfterOrderByEventDateAsc(eq(1L), any(LocalDateTime.class))).thenReturn(List.of());
        assertTrue(service.findUpcoming(1L).isEmpty());
    }

    @Test
    void findByType_delegatesToRepository() {
        when(repository.findByInstitutionIdAndEventTypeOrderByEventDateDesc(1L, "REUNION")).thenReturn(List.of());
        assertTrue(service.findByType(1L, "REUNION").isEmpty());
    }

    @Test
    void save_delegatesToRepository() {
        SchoolEvent event = new SchoolEvent();
        when(repository.save(event)).thenReturn(event);
        assertNotNull(service.save(event));
    }

    @Test
    void delete_delegatesToRepository() {
        service.delete(1L);
        verify(repository).deleteById(1L);
    }
}
