package com.leccionario.backend.evaluation.service;

import com.leccionario.backend.evaluation.domain.ReportCard;
import com.leccionario.backend.evaluation.repository.EvaluationRepository;
import com.leccionario.backend.evaluation.repository.PeriodGradeRepository;
import com.leccionario.backend.evaluation.repository.ReportCardDetailRepository;
import com.leccionario.backend.evaluation.repository.ReportCardRepository;
import com.leccionario.backend.lessonplan.repository.LessonPlanRepository;
import com.leccionario.backend.user.repository.StudentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ReportCardServiceTest {

    private ReportCardRepository reportCardRepository;
    private ReportCardDetailRepository detailRepository;
    private PeriodGradeRepository periodGradeRepository;
    private EvaluationRepository evaluationRepository;
    private StudentRepository studentRepository;
    private LessonPlanRepository lessonPlanRepository;
    private ReportCardService service;

    @BeforeEach
    void setUp() {
        reportCardRepository = mock(ReportCardRepository.class);
        detailRepository = mock(ReportCardDetailRepository.class);
        periodGradeRepository = mock(PeriodGradeRepository.class);
        evaluationRepository = mock(EvaluationRepository.class);
        studentRepository = mock(StudentRepository.class);
        lessonPlanRepository = mock(LessonPlanRepository.class);
        service = new ReportCardService(reportCardRepository, detailRepository,
            periodGradeRepository, evaluationRepository, studentRepository, lessonPlanRepository);
    }

    @Test
    void getReportCardsByPeriod_delegatesToRepository() {
        when(reportCardRepository.findByAcademicPeriodId(1L)).thenReturn(List.of());
        var result = service.getReportCardsByPeriod(1L);
        assertNotNull(result);
        assertTrue(result.isEmpty());
    }

    @Test
    void getReportCardsByCourseAndPeriod_delegatesToRepository() {
        when(reportCardRepository.findByCourseIdAndAcademicPeriodId(1L, 1L)).thenReturn(List.of());
        var result = service.getReportCardsByCourseAndPeriod(1L, 1L);
        assertNotNull(result);
        assertTrue(result.isEmpty());
    }

    @Test
    void getReportCard_throwsWhenNotFound() {
        when(reportCardRepository.findByStudentIdAndCourseIdAndAcademicPeriodId(10L, 5L, 1L)).thenReturn(Optional.empty());
        assertThrows(RuntimeException.class, () -> service.getReportCard(10L, 5L, 1L));
    }

    @Test
    void getReportCardStats_returnsCounts() {
        when(reportCardRepository.findByAcademicPeriodId(1L)).thenReturn(List.of(new ReportCard(), new ReportCard()));
        when(reportCardRepository.countFinalizedByPeriod(1L)).thenReturn(1L);
        Map<String, Object> stats = service.getReportCardStats(1L);
        assertEquals(2L, stats.get("total"));
        assertEquals(1L, stats.get("finalized"));
        assertEquals(1L, stats.get("pending"));
    }
}
