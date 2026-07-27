package com.leccionario.backend.evaluation.service;

import com.leccionario.backend.evaluation.domain.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class CompetencyServiceTest {

    private CompetencyRepository repository;
    private CompetencyService service;

    @BeforeEach
    void setUp() {
        repository = mock(CompetencyRepository.class);
        service = new CompetencyService(repository);
    }

    @Test
    void findAll_delegatesToRepository() {
        when(repository.findByInstitutionIdAndIsActiveTrueOrderByNameAsc(1L)).thenReturn(List.of());
        List<Competency> result = service.findAll(1L);
        assertNotNull(result);
    }

    @Test
    void findByType_filtersByType() {
        when(repository.findByInstitutionIdAndCompetencyTypeOrderByNameAsc(1L, "GENERALES")).thenReturn(List.of());
        List<Competency> result = service.findByType(1L, "GENERALES");
        assertNotNull(result);
    }

    @Test
    void create_savesCompetency() {
        Competency c = Competency.builder()
            .institutionId(1L).code("GEN-001").name("Pensamiento Critico")
            .competencyType("GENERALES").isActive(true).build();
        when(repository.save(any())).thenReturn(c);
        Competency saved = service.create(c);
        assertEquals("GEN-001", saved.getCode());
    }

    @Test
    void update_modifiesFields() {
        Competency existing = new Competency();
        existing.setId(1L);
        existing.setCode("OLD");
        existing.setName("Old Name");
        existing.setIsActive(true);
        Competency data = Competency.builder().code("NEW").name("New Name").competencyType("ESPECIFICAS").build();
        when(repository.findById(1L)).thenReturn(Optional.of(existing));
        when(repository.save(any())).thenReturn(existing);
        Competency updated = service.update(1L, data);
        assertEquals("NEW", updated.getCode());
        assertEquals("ESPECIFICAS", updated.getCompetencyType());
    }

    @Test
    void delete_softDeletes() {
        Competency existing = new Competency();
        existing.setId(1L);
        existing.setIsActive(true);
        when(repository.findById(1L)).thenReturn(Optional.of(existing));
        when(repository.save(any())).thenReturn(existing);
        service.delete(1L);
        assertFalse(existing.getIsActive());
    }
}
