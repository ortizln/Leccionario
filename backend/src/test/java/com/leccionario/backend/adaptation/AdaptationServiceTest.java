package com.leccionario.backend.adaptation;

import com.leccionario.backend.adaptation.dto.AdaptationDTO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class AdaptationServiceTest {

    private CurricularAdaptationRepository adaptationRepository;
    private AdaptationService service;

    @BeforeEach
    void setUp() {
        adaptationRepository = mock(CurricularAdaptationRepository.class);
        service = new AdaptationService(adaptationRepository);
    }

    @Test
    void findAll_delegatesToRepository() {
        when(adaptationRepository.findAllByOrderByCreatedAtDesc()).thenReturn(List.of());
        List<AdaptationDTO> result = service.findAll();
        assertNotNull(result);
        assertTrue(result.isEmpty());
    }

    @Test
    void create_savesAndReturnsDTO() {
        CurricularAdaptation a = new CurricularAdaptation();
        a.setStudentId(10L);
        a.setAdaptationType("METODOLOGICA");
        a.setDescription("Apoyo visual");
        when(adaptationRepository.save(any())).thenAnswer(inv -> {
            CurricularAdaptation saved = inv.getArgument(0);
            saved.setId(1L);
            return saved;
        });
        AdaptationDTO result = service.create(a, "teacher1");
        assertNotNull(result);
        assertEquals("teacher1", result.createdBy());
    }

    @Test
    void update_modifiesExisting() {
        CurricularAdaptation existing = new CurricularAdaptation();
        existing.setId(1L);
        existing.setDescription("Old");
        CurricularAdaptation updates = new CurricularAdaptation();
        updates.setDescription("New");
        updates.setAdaptationType("CURRICULAR");
        when(adaptationRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(adaptationRepository.save(any())).thenReturn(existing);
        AdaptationDTO result = service.update(1L, updates);
        assertEquals("New", existing.getDescription());
    }

    @Test
    void delete_delegatesToRepository() {
        service.delete(1L);
        verify(adaptationRepository).deleteById(1L);
    }

    @Test
    void findByStudent_delegatesToRepository() {
        when(adaptationRepository.findByStudentIdOrderByCreatedAtDesc(10L)).thenReturn(List.of());
        List<AdaptationDTO> result = service.findByStudent(10L);
        assertNotNull(result);
        assertTrue(result.isEmpty());
    }

    @Test
    void findByNEE_delegatesToRepository() {
        when(adaptationRepository.findBySpecialNeedsId(5L)).thenReturn(List.of());
        List<AdaptationDTO> result = service.findByNEE(5L);
        assertNotNull(result);
        assertTrue(result.isEmpty());
    }
}
