package com.leccionario.backend.institution.service;

import com.leccionario.backend.institution.domain.SchoolCalendarEvent;
import com.leccionario.backend.institution.repository.SchoolCalendarEventRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class SchoolCalendarServiceTest {

    private SchoolCalendarEventRepository repository;
    private SchoolCalendarService service;

    @BeforeEach
    void setUp() {
        repository = mock(SchoolCalendarEventRepository.class);
        service = new SchoolCalendarService(repository);
    }

    @Test
    void create_savesEvent() {
        SchoolCalendarEvent event = new SchoolCalendarEvent();
        event.setEventName("Reunion");
        event.setInstitutionId(1L);
        when(repository.save(any())).thenReturn(event);
        SchoolCalendarEvent saved = service.create(event);
        assertEquals("Reunion", saved.getEventName());
    }

    @Test
    void findById_delegatesToRepository() {
        SchoolCalendarEvent event = new SchoolCalendarEvent();
        event.setId(1L);
        event.setEventName("Feria");
        when(repository.findById(1L)).thenReturn(Optional.of(event));
        SchoolCalendarEvent result = service.findById(1L);
        assertEquals("Feria", result.getEventName());
    }

    @Test
    void findByInstitution_filtersActive() {
        when(repository.findByInstitutionIdAndActiveTrueOrderByStartDate(1L)).thenReturn(List.of());
        List<SchoolCalendarEvent> result = service.findByInstitution(1L);
        assertNotNull(result);
    }

    @Test
    void update_modifiesEvent() {
        SchoolCalendarEvent existing = new SchoolCalendarEvent();
        existing.setId(1L);
        existing.setEventName("Old");
        existing.setActive(true);
        SchoolCalendarEvent updates = new SchoolCalendarEvent();
        updates.setEventName("New");
        updates.setEventType("EXAMEN");
        when(repository.findById(1L)).thenReturn(Optional.of(existing));
        when(repository.save(any())).thenReturn(existing);
        SchoolCalendarEvent result = service.update(1L, updates);
        assertEquals("New", result.getEventName());
    }

    @Test
    void delete_removesEvent() {
        service.delete(1L);
        verify(repository).deleteById(1L);
    }
}
