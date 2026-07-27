package com.leccionario.backend.report.service;

import com.leccionario.backend.evaluation.repository.EvaluationRepository;
import com.leccionario.backend.lessonplan.repository.LessonPlanRepository;
import com.leccionario.backend.user.repository.StudentRepository;
import com.leccionario.backend.user.repository.TeacherRepository;
import com.leccionario.backend.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ReportServiceTest {

    private UserRepository userRepository;
    private TeacherRepository teacherRepository;
    private StudentRepository studentRepository;
    private LessonPlanRepository lessonPlanRepository;
    private EvaluationRepository evaluationRepository;
    private ReportService service;

    @BeforeEach
    void setUp() {
        userRepository = mock(UserRepository.class);
        teacherRepository = mock(TeacherRepository.class);
        studentRepository = mock(StudentRepository.class);
        lessonPlanRepository = mock(LessonPlanRepository.class);
        evaluationRepository = mock(EvaluationRepository.class);
        service = new ReportService(userRepository, teacherRepository, studentRepository,
            lessonPlanRepository, evaluationRepository);
    }

    @Test
    void getDashboardMetrics_returnsNonNull() {
        when(userRepository.count()).thenReturn(10L);
        when(teacherRepository.count()).thenReturn(5L);
        when(studentRepository.count()).thenReturn(100L);
        when(lessonPlanRepository.count()).thenReturn(50L);
        when(evaluationRepository.count()).thenReturn(30L);
        var result = service.getDashboardMetrics();
        assertNotNull(result);
    }

    @Test
    void exportLessonPlansPdf_returnsBytes() {
        when(lessonPlanRepository.findAll()).thenReturn(java.util.List.of());
        byte[] pdf = service.exportLessonPlansPdf(1L);
        assertNotNull(pdf);
        assertTrue(pdf.length > 0);
    }
}
