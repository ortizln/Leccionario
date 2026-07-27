package com.leccionario.backend.demerit.service;

import com.leccionario.backend.audit.service.AuditService;
import com.leccionario.backend.common.exception.BusinessException;
import com.leccionario.backend.common.exception.ResourceNotFoundException;
import com.leccionario.backend.demerit.domain.DemeritCategory;
import com.leccionario.backend.demerit.dto.DemeritCategoryRequest;
import com.leccionario.backend.demerit.repository.DemeritCategoryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class DemeritCategoryServiceTest {

    private DemeritCategoryRepository repository;
    private AuditService auditService;
    private DemeritCategoryService service;

    @BeforeEach
    void setUp() {
        repository = mock(DemeritCategoryRepository.class);
        auditService = mock(AuditService.class);
        service = new DemeritCategoryService(repository, auditService);
    }

    @Test
    void findAll_delegatesToRepository() {
        when(repository.findAll()).thenReturn(List.of());
        assertTrue(service.findAll().isEmpty());
    }

    @Test
    void create_savesAndAudits() {
        when(repository.findByCodeIgnoreCase("CAT-01")).thenReturn(Optional.empty());
        when(repository.save(any())).thenAnswer(inv -> {
            DemeritCategory c = inv.getArgument(0);
            c.setId(1L);
            return c;
        });

        DemeritCategoryRequest req = new DemeritCategoryRequest("CAT-01", "Academica", "Faltas academicas", (short) 1, true);
        var result = service.create(req, "admin");
        assertNotNull(result);
        verify(auditService).log(eq("admin"), eq("CREATE"), eq("DEMERIT_CATEGORY"), any());
    }

    @Test
    void create_duplicateCode_throws() {
        DemeritCategory existing = new DemeritCategory();
        existing.setId(1L);
        when(repository.findByCodeIgnoreCase("CAT-01")).thenReturn(Optional.of(existing));
        assertThrows(BusinessException.class, () -> service.create(new DemeritCategoryRequest("CAT-01", "A", "D", (short) 1, true), "admin"));
    }

    @Test
    void delete_found() {
        DemeritCategory c = new DemeritCategory();
        c.setId(1L);
        when(repository.findById(1L)).thenReturn(Optional.of(c));
        service.delete(1L, "admin");
        verify(repository).delete(c);
    }

    @Test
    void delete_notFound_throws() {
        when(repository.findById(1L)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> service.delete(1L, "admin"));
    }
}
