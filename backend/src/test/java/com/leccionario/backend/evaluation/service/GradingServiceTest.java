package com.leccionario.backend.evaluation.service;

import com.leccionario.backend.audit.service.AuditService;
import com.leccionario.backend.evaluation.domain.GradeScale;
import com.leccionario.backend.evaluation.domain.EvaluationType;
import com.leccionario.backend.evaluation.dto.GradeScaleRequest;
import com.leccionario.backend.evaluation.dto.GradeScaleResponse;
import com.leccionario.backend.evaluation.dto.EvaluationTypeRequest;
import com.leccionario.backend.evaluation.dto.EvaluationTypeResponse;
import com.leccionario.backend.evaluation.repository.EvaluationTypeRepository;
import com.leccionario.backend.evaluation.repository.GradeScaleRepository;
import com.leccionario.backend.evaluation.repository.EvaluationRepository;
import com.leccionario.backend.evaluation.repository.GradeRepository;
import com.leccionario.backend.evaluation.repository.PeriodGradeRepository;
import com.leccionario.backend.evaluation.repository.GradeHistoryRepository;
import com.leccionario.backend.lessonplan.repository.LessonPlanRepository;
import com.leccionario.backend.user.repository.StudentRepository;
import com.leccionario.backend.common.exception.ResourceNotFoundException;
import com.leccionario.backend.institution.domain.Institution;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class GradingServiceTest {

    private GradeScaleRepository gradeScaleRepository;
    private EvaluationTypeRepository evaluationTypeRepository;
    private EvaluationRepository evaluationRepository;
    private GradeRepository gradeRepository;
    private PeriodGradeRepository periodGradeRepository;
    private GradeHistoryRepository gradeHistoryRepository;
    private LessonPlanRepository lessonPlanRepository;
    private StudentRepository studentRepository;
    private AuditService auditService;
    private GradingService service;

    @BeforeEach
    void setUp() {
        gradeScaleRepository = mock(GradeScaleRepository.class);
        evaluationTypeRepository = mock(EvaluationTypeRepository.class);
        evaluationRepository = mock(EvaluationRepository.class);
        gradeRepository = mock(GradeRepository.class);
        periodGradeRepository = mock(PeriodGradeRepository.class);
        gradeHistoryRepository = mock(GradeHistoryRepository.class);
        lessonPlanRepository = mock(LessonPlanRepository.class);
        studentRepository = mock(StudentRepository.class);
        auditService = mock(AuditService.class);
        service = new GradingService(gradeScaleRepository, evaluationTypeRepository,
            evaluationRepository, gradeRepository, periodGradeRepository,
            gradeHistoryRepository, lessonPlanRepository, studentRepository, auditService);
    }

    @Test
    void createScale_savesAndReturnsResponse() {
        when(gradeScaleRepository.save(any(GradeScale.class))).thenAnswer(inv -> {
            GradeScale s = inv.getArgument(0);
            s.setId(1L);
            return s;
        });
        GradeScaleRequest req = new GradeScaleRequest();
        req.setName("Escala 1-10");
        req.setScaleType("NUMERICA");
        req.setMinValue(BigDecimal.ZERO);
        req.setMaxValue(BigDecimal.TEN);
        req.setPassValue(new BigDecimal("6.00"));
        req.setIsDefault(false);
        GradeScaleResponse result = service.createScale(req, 1L, "admin");
        assertEquals("Escala 1-10", result.getName());
        verify(auditService).log(eq("admin"), eq("CREATE"), eq("GRADE_SCALE"), any());
    }

    @Test
    void getScalesByInstitution_returnsList() {
        when(gradeScaleRepository.findByInstitutionIdAndActiveTrue(1L)).thenReturn(List.of());
        List<GradeScaleResponse> result = service.getScalesByInstitution(1L);
        assertNotNull(result);
        assertTrue(result.isEmpty());
    }

    @Test
    void deleteScale_throwsWhenNotFound() {
        when(gradeScaleRepository.findById(99L)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () ->
            service.deleteScale(99L, 1L, "admin"));
    }

    @Test
    void createEvaluationType_savesAndAudits() {
        when(evaluationTypeRepository.save(any(EvaluationType.class))).thenAnswer(inv -> {
            EvaluationType et = inv.getArgument(0);
            et.setId(1L);
            return et;
        });
        EvaluationTypeRequest req = new EvaluationTypeRequest();
        req.setName("Parcial");
        req.setCode("PAR");
        req.setWeightPct(new BigDecimal("40.00"));
        EvaluationTypeResponse result = service.createEvaluationType(req, 1L, "admin");
        assertEquals("Parcial", result.getName());
        verify(auditService).log(eq("admin"), eq("CREATE"), eq("EVALUATION_TYPE"), any());
    }

    @Test
    void deleteEvaluationType_setsInactive() {
        EvaluationType et = new EvaluationType();
        et.setId(1L);
        Institution inst = new Institution();
        inst.setId(1L);
        et.setInstitution(inst);
        et.setName("Parcial");
        et.setActive(true);
        when(evaluationTypeRepository.findById(1L)).thenReturn(Optional.of(et));
        when(evaluationTypeRepository.save(any())).thenReturn(et);
        service.deleteEvaluationType(1L, 1L, "admin");
        assertFalse(et.getActive());
    }

    @Test
    void deleteEvaluationType_throwsForWrongInstitution() {
        EvaluationType et = new EvaluationType();
        et.setId(1L);
        Institution inst = new Institution();
        inst.setId(2L);
        et.setInstitution(inst);
        when(evaluationTypeRepository.findById(1L)).thenReturn(Optional.of(et));
        assertThrows(ResourceNotFoundException.class, () ->
            service.deleteEvaluationType(1L, 1L, "admin"));
    }
}
