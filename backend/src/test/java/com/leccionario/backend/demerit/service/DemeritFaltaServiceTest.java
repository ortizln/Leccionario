package com.leccionario.backend.demerit.service;

import com.leccionario.backend.audit.service.AuditService;
import com.leccionario.backend.common.exception.ResourceNotFoundException;
import com.leccionario.backend.demerit.domain.DemeritCategory;
import com.leccionario.backend.demerit.domain.DemeritFalta;
import com.leccionario.backend.demerit.dto.DemeritFaltaRequest;
import com.leccionario.backend.demerit.repository.DemeritCategoryRepository;
import com.leccionario.backend.demerit.repository.DemeritFaltaRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class DemeritFaltaServiceTest {

    private DemeritFaltaRepository faltaRepository;
    private DemeritCategoryRepository categoryRepository;
    private AuditService auditService;
    private DemeritFaltaService service;

    @BeforeEach
    void setUp() {
        faltaRepository = mock(DemeritFaltaRepository.class);
        categoryRepository = mock(DemeritCategoryRepository.class);
        auditService = mock(AuditService.class);
        service = new DemeritFaltaService(faltaRepository, categoryRepository, auditService);
    }

    @Test
    void findAll_delegatesToRepository() {
        when(faltaRepository.findAll()).thenReturn(List.of());
        assertTrue(service.findAll().isEmpty());
    }

    @Test
    void findActiveOptions_filtersActive() {
        when(faltaRepository.findByActiveTrue()).thenReturn(List.of());
        assertTrue(service.findActiveOptions().isEmpty());
    }

    @Test
    void findByCategory_delegatesToRepository() {
        when(faltaRepository.findByCategoryIdAndActiveTrue(1L)).thenReturn(List.of());
        assertTrue(service.findByCategory(1L).isEmpty());
    }

    @Test
    void create_savesAndAudits() {
        DemeritCategory cat = new DemeritCategory();
        cat.setId(1L);
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(cat));
        when(faltaRepository.findByCategoryIdAndCodeIgnoreCase(1L, "F-01")).thenReturn(Optional.empty());
        when(faltaRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        DemeritFaltaRequest req = new DemeritFaltaRequest(1L, "F-01", "Falta leve", (short) 5, "LEVE", false, false, false, true);
        var result = service.create(req, "admin");
        assertNotNull(result);
        verify(auditService).log(eq("admin"), eq("CREATE"), eq("DEMERIT_FALTA"), any());
    }

    @Test
    void create_categoryNotFound_throws() {
        when(categoryRepository.findById(1L)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> service.create(new DemeritFaltaRequest(1L, "F-01", "D", (short) 5, "LEVE", false, false, false, true), "admin"));
    }

    @Test
    void delete_found() {
        DemeritFalta f = new DemeritFalta();
        f.setId(1L);
        when(faltaRepository.findById(1L)).thenReturn(Optional.of(f));
        service.delete(1L, "admin");
        verify(faltaRepository).delete(f);
    }

    @Test
    void delete_notFound_throws() {
        when(faltaRepository.findById(1L)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> service.delete(1L, "admin"));
    }
}
