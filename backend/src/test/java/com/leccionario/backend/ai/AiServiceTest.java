package com.leccionario.backend.ai;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class AiServiceTest {

    private AiModelRepository modelRepository;
    private AiPredictionRepository predictionRepository;
    private AiRecommendationRepository recommendationRepository;
    private AiAnomalyRepository anomalyRepository;
    private AiStudentProfileRepository profileRepository;
    private JdbcTemplate jdbc;
    private AiService service;

    @BeforeEach
    void setUp() {
        modelRepository = mock(AiModelRepository.class);
        predictionRepository = mock(AiPredictionRepository.class);
        recommendationRepository = mock(AiRecommendationRepository.class);
        anomalyRepository = mock(AiAnomalyRepository.class);
        profileRepository = mock(AiStudentProfileRepository.class);
        jdbc = mock(JdbcTemplate.class);
        service = new AiService(modelRepository, predictionRepository, recommendationRepository, anomalyRepository, profileRepository, jdbc);
    }

    @Test
    void findAllModels_delegatesToRepository() {
        when(modelRepository.findByInstitutionIdOrderByNameAsc(1L)).thenReturn(List.of());
        List<AiModel> result = service.findAllModels(1L);
        assertNotNull(result);
        assertTrue(result.isEmpty());
    }

    @Test
    void createModel_savesModel() {
        AiModel model = new AiModel();
        model.setName("Riesgo Academico");
        when(modelRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        AiModel result = service.createModel(model);
        assertEquals("Riesgo Academico", result.getName());
    }

    @Test
    void getRecommendationStats_returnsCounts() {
        when(recommendationRepository.findByInstitutionIdOrderByCreatedAtDesc(1L)).thenReturn(List.of(new AiRecommendation(), new AiRecommendation()));
        when(recommendationRepository.findByInstitutionIdAndStatusOrderByCreatedAtDesc(1L, "PENDIENTE")).thenReturn(List.of(new AiRecommendation()));
        when(recommendationRepository.findByInstitutionIdAndStatusOrderByCreatedAtDesc(1L, "APLICADA")).thenReturn(List.of());
        Map<String, Object> stats = service.getRecommendationStats(1L);
        assertEquals(2L, stats.get("total"));
        assertEquals(1L, stats.get("pending"));
        assertEquals(0L, stats.get("applied"));
    }

    @Test
    void applyRecommendation_setsStatus() {
        AiRecommendation r = new AiRecommendation();
        r.setId(1L);
        r.setStatus("PENDIENTE");
        when(recommendationRepository.findById(1L)).thenReturn(Optional.of(r));
        when(recommendationRepository.save(any())).thenReturn(r);
        AiRecommendation result = service.applyRecommendation(1L);
        assertEquals("APLICADA", r.getStatus());
        assertNotNull(r.getAppliedAt());
    }

    @Test
    void dismissRecommendation_setsStatus() {
        AiRecommendation r = new AiRecommendation();
        r.setId(1L);
        r.setStatus("PENDIENTE");
        when(recommendationRepository.findById(1L)).thenReturn(Optional.of(r));
        when(recommendationRepository.save(any())).thenReturn(r);
        service.dismissRecommendation(1L);
        assertEquals("DESCARTADA", r.getStatus());
    }

    @Test
    void getAnomalies_delegatesToRepository() {
        when(anomalyRepository.findByInstitutionIdOrderByCreatedAtDesc(1L)).thenReturn(List.of());
        List<AiAnomaly> result = service.getAnomalies(1L);
        assertNotNull(result);
        assertTrue(result.isEmpty());
    }

    @Test
    void resolveAnomaly_setsResolved() {
        AiAnomaly a = new AiAnomaly();
        a.setId(1L);
        when(anomalyRepository.findById(1L)).thenReturn(Optional.of(a));
        when(anomalyRepository.save(any())).thenReturn(a);
        AiAnomaly result = service.resolveAnomaly(1L, "Corregido");
        assertEquals("RESUELTA", a.getStatus());
        assertEquals("Corregido", a.getNotes());
        assertNotNull(a.getResolvedAt());
    }

    @Test
    void getStudentProfile_delegatesToRepository() {
        when(profileRepository.findByStudentIdAndInstitutionId(10L, 1L)).thenReturn(Optional.empty());
        AiStudentProfile result = service.getStudentProfile(10L, 1L);
        assertNull(result);
    }
}
