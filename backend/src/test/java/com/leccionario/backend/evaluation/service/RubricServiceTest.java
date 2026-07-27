package com.leccionario.backend.evaluation.service;

import com.leccionario.backend.evaluation.domain.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class RubricServiceTest {

    private RubricRepository repository;
    private RubricService service;

    @BeforeEach
    void setUp() {
        repository = mock(RubricRepository.class);
        service = new RubricService(repository);
    }

    @Test
    void findAll_delegatesToRepository() {
        when(repository.findByInstitutionIdOrderByCreatedAtDesc(1L)).thenReturn(List.of());
        List<Rubric> result = service.findAll(1L);
        assertNotNull(result);
    }

    @Test
    void create_savesRubric() {
        Rubric rubric = Rubric.builder()
            .institutionId(1L).name("Proyecto Final")
            .totalPoints(new BigDecimal("100.00")).criteria("[]").build();
        when(repository.save(any())).thenReturn(rubric);
        Rubric saved = service.create(rubric);
        assertEquals("Proyecto Final", saved.getName());
    }

    @Test
    void update_modifiesFields() {
        Rubric existing = new Rubric();
        existing.setId(1L);
        existing.setName("V1");
        existing.setTotalPoints(new BigDecimal("50"));
        Rubric data = Rubric.builder().name("V2").totalPoints(new BigDecimal("100")).criteria("[{}]").build();
        when(repository.findById(1L)).thenReturn(Optional.of(existing));
        when(repository.save(any())).thenReturn(existing);
        Rubric updated = service.update(1L, data);
        assertEquals("V2", updated.getName());
    }

    @Test
    void delete_callsRepository() {
        when(repository.findById(1L)).thenReturn(Optional.of(new Rubric()));
        service.delete(1L);
        verify(repository).deleteById(1L);
    }
}
