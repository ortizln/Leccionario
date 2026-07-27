package com.leccionario.backend.demerit.service;

import com.leccionario.backend.audit.service.AuditService;
import com.leccionario.backend.common.exception.ResourceNotFoundException;
import com.leccionario.backend.demerit.domain.Demerit;
import com.leccionario.backend.demerit.dto.DemeritRequest;
import com.leccionario.backend.demerit.repository.DemeritRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class DemeritServiceTest {

    private DemeritRepository demeritRepository;
    private AuditService auditService;
    private DemeritService service;

    @BeforeEach
    void setUp() {
        demeritRepository = mock(DemeritRepository.class);
        auditService = mock(AuditService.class);
        service = new DemeritService(demeritRepository, auditService);
    }

    @Test
    void findAll_delegatesToRepository() {
        when(demeritRepository.findAll()).thenReturn(List.of());
        assertTrue(service.findAll().isEmpty());
    }

    @Test
    void findActiveOptions_filtersActiveOnly() {
        Demerit d = new Demerit();
        d.setActive(true);
        when(demeritRepository.findAll()).thenReturn(List.of(d));
        assertFalse(service.findActiveOptions().isEmpty());
    }

    @Test
    void requireById_found() {
        Demerit d = new Demerit();
        d.setId(1L);
        when(demeritRepository.findById(1L)).thenReturn(Optional.of(d));
        assertNotNull(service.requireById(1L));
    }

    @Test
    void requireById_notFound_throws() {
        when(demeritRepository.findById(1L)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> service.requireById(1L));
    }

    @Test
    void create_savesAndAudits() {
        when(demeritRepository.findByCodeIgnoreCase("DM-01")).thenReturn(Optional.empty());
        when(demeritRepository.save(any())).thenAnswer(inv -> {
            Demerit d = inv.getArgument(0);
            d.setId(1L);
            return d;
        });

        DemeritRequest req = new DemeritRequest("DM-01", "ACADEMICA", "Falta leve", (short) 5, true);

        var result = service.create(req, "admin");
        assertNotNull(result);
        verify(auditService).log(eq("admin"), eq("CREATE"), eq("DEMERIT"), any());
    }

    @Test
    void create_duplicateCode_throws() {
        Demerit existing = new Demerit();
        when(demeritRepository.findByCodeIgnoreCase("DM-01")).thenReturn(Optional.of(existing));
        assertThrows(RuntimeException.class, () -> service.create(new DemeritRequest("DM-01", "CAT", "Desc", (short) 1, true), "admin"));
    }

    @Test
    void delete_savesAndAudits() {
        Demerit d = new Demerit();
        d.setId(1L);
        when(demeritRepository.findById(1L)).thenReturn(Optional.of(d));
        service.delete(1L, "admin");
        verify(demeritRepository).delete(d);
        verify(auditService).log(eq("admin"), eq("DELETE"), eq("DEMERIT"), any());
    }

    @Test
    void delete_notFound_throws() {
        when(demeritRepository.findById(1L)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> service.delete(1L, "admin"));
    }
}
