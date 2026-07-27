package com.leccionario.backend.lessonplan.service;

import com.leccionario.backend.audit.service.AuditService;
import com.leccionario.backend.common.exception.BusinessException;
import com.leccionario.backend.common.exception.ResourceNotFoundException;
import com.leccionario.backend.lessonplan.domain.LessonPlan;
import com.leccionario.backend.lessonplan.dto.LessonPlanRequest;
import com.leccionario.backend.lessonplan.dto.LessonPlanResponse;
import com.leccionario.backend.lessonplan.mapper.LessonPlanMapper;
import com.leccionario.backend.lessonplan.repository.LessonPlanRepository;
import com.leccionario.backend.schedule.repository.CourseScheduleRepository;
import com.leccionario.backend.user.domain.Teacher;
import com.leccionario.backend.user.repository.TeacherRepository;
import com.leccionario.backend.academic.domain.Course;
import com.leccionario.backend.academic.domain.Subject;
import com.leccionario.backend.academic.domain.AcademicPeriod;
import com.leccionario.backend.academic.repository.CourseRepository;
import com.leccionario.backend.academic.repository.SubjectRepository;
import com.leccionario.backend.academic.repository.AcademicPeriodRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class LessonPlanServiceTest {

    private LessonPlanRepository lessonPlanRepository;
    private TeacherRepository teacherRepository;
    private SubjectRepository subjectRepository;
    private CourseRepository courseRepository;
    private AcademicPeriodRepository academicPeriodRepository;
    private CourseScheduleRepository courseScheduleRepository;
    private LessonPlanMapper lessonPlanMapper;
    private AuditService auditService;
    private LessonPlanService service;

    @BeforeEach
    void setUp() {
        lessonPlanRepository = mock(LessonPlanRepository.class);
        teacherRepository = mock(TeacherRepository.class);
        subjectRepository = mock(SubjectRepository.class);
        courseRepository = mock(CourseRepository.class);
        academicPeriodRepository = mock(AcademicPeriodRepository.class);
        courseScheduleRepository = mock(CourseScheduleRepository.class);
        lessonPlanMapper = mock(LessonPlanMapper.class);
        auditService = mock(AuditService.class);
        service = new LessonPlanService(lessonPlanRepository, teacherRepository, subjectRepository,
            courseRepository, academicPeriodRepository, courseScheduleRepository, lessonPlanMapper, auditService);
    }

    private LessonPlanRequest makeRequest() {
        return new LessonPlanRequest(
            LocalDate.now(), 1L, 1L, 1L, 1L,
            "Tema", "Objetivo", "Actividades", "Recursos", "Observaciones", true
        );
    }

    @Test
    void create_savesAndReturns() {
        Teacher teacher = new Teacher();
        Subject subject = new Subject();
        Course course = new Course();
        AcademicPeriod period = new AcademicPeriod();
        when(courseScheduleRepository.existsByCourseIdAndPeriodIdAndTeacherIdAndSubjectIdAndWeekday(1L, 1L, 1L, 1L, (short) LocalDate.now().getDayOfWeek().getValue())).thenReturn(true);
        when(teacherRepository.findById(1L)).thenReturn(Optional.of(teacher));
        when(subjectRepository.findById(1L)).thenReturn(Optional.of(subject));
        when(courseRepository.findById(1L)).thenReturn(Optional.of(course));
        when(academicPeriodRepository.findById(1L)).thenReturn(Optional.of(period));
        when(lessonPlanRepository.save(any())).thenAnswer(inv -> {
            LessonPlan lp = inv.getArgument(0);
            lp.setId(1L);
            return lp;
        });
        when(lessonPlanMapper.toResponse(any())).thenReturn(new LessonPlanResponse(1L, LocalDate.now(), "Prof.", "Mat", "1ro A", "2024", "Tema", true));

        LessonPlanRequest req = makeRequest();
        LessonPlanResponse result = service.create(req, "teacher1");
        assertNotNull(result);
        verify(auditService).log(eq("teacher1"), eq("CREATE"), eq("LESSON_PLAN"), any());
    }

    @Test
    void create_throwsWhenScheduleNotAssigned() {
        when(courseScheduleRepository.existsByCourseIdAndPeriodIdAndTeacherIdAndSubjectIdAndWeekday(anyLong(), anyLong(), anyLong(), anyLong(), anyShort())).thenReturn(false);
        assertThrows(BusinessException.class, () -> service.create(makeRequest(), "teacher1"));
    }

    @Test
    void create_throwsWhenTeacherNotFound() {
        when(courseScheduleRepository.existsByCourseIdAndPeriodIdAndTeacherIdAndSubjectIdAndWeekday(anyLong(), anyLong(), anyLong(), anyLong(), anyShort())).thenReturn(true);
        when(teacherRepository.findById(1L)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> service.create(makeRequest(), "teacher1"));
    }

    @Test
    void findByDateRange_delegatesToRepository() {
        when(lessonPlanRepository.findByLessonDateBetween(any(), any())).thenReturn(List.of());
        when(lessonPlanMapper.toResponse(any())).thenReturn(new LessonPlanResponse(1L, LocalDate.now(), "Prof.", "Mat", "1ro A", "2024", "Tema", true));
        var result = service.findByDateRange(LocalDate.now().minusDays(7), LocalDate.now());
        assertNotNull(result);
        assertTrue(result.isEmpty());
    }
}
