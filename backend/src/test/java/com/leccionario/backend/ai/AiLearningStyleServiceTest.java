package com.leccionario.backend.ai;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class AiLearningStyleServiceTest {

    private AiLearningStyleRepository repo;
    private AiLearningStyleService service;

    @BeforeEach
    void setUp() {
        repo = mock(AiLearningStyleRepository.class);
        service = new AiLearningStyleService(repo);
    }

    @Test
    void findByStudent_delegatesToRepository() {
        AiLearningStyle style = new AiLearningStyle();
        when(repo.findByStudentIdAndInstitutionId(1L, 1L)).thenReturn(Optional.of(style));
        assertTrue(service.findByStudent(1L, 1L).isPresent());
    }

    @Test
    void findByStudent_notFound_returnsEmpty() {
        when(repo.findByStudentIdAndInstitutionId(1L, 1L)).thenReturn(Optional.empty());
        assertTrue(service.findByStudent(1L, 1L).isEmpty());
    }

    @Test
    void save_setsDominantStyleAndIncrementsCount() {
        AiLearningStyle style = new AiLearningStyle();
        style.setVisualScore(8.0);
        style.setAuditoryScore(3.0);
        style.setKinestheticScore(5.0);
        style.setReadingScore(2.0);
        style.setAssessmentCount(0);
        when(repo.save(any())).thenAnswer(inv -> inv.getArgument(0));

        AiLearningStyle result = service.save(style);
        assertEquals("VISUAL", result.getDominantStyle());
        assertEquals(1, result.getAssessmentCount());
    }

    @Test
    void save_incrementsCountEachTime() {
        AiLearningStyle style = new AiLearningStyle();
        style.setVisualScore(1.0);
        style.setAuditoryScore(2.0);
        style.setKinestheticScore(3.0);
        style.setReadingScore(4.0);
        style.setAssessmentCount(5);
        when(repo.save(any())).thenAnswer(inv -> inv.getArgument(0));

        AiLearningStyle result = service.save(style);
        assertEquals("LECTURA_ESCRITURA", result.getDominantStyle());
        assertEquals(6, result.getAssessmentCount());
    }
}
