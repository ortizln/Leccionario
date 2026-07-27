package com.leccionario.backend.schedule.service;

import com.leccionario.backend.audit.service.AuditService;
import com.leccionario.backend.schedule.repository.CourseScheduleRepository;
import com.leccionario.backend.academic.repository.CourseRepository;
import com.leccionario.backend.academic.repository.AcademicPeriodRepository;
import com.leccionario.backend.academic.repository.SubjectRepository;
import com.leccionario.backend.user.repository.TeacherRepository;
import com.leccionario.backend.schedule.repository.ScheduleBlockRepository;
import com.leccionario.backend.academic.domain.Course;
import com.leccionario.backend.schedule.domain.CourseSchedule;
import com.leccionario.backend.academic.domain.AcademicPeriod;
import com.leccionario.backend.schedule.domain.ScheduleBlock;
import com.leccionario.backend.user.domain.Teacher;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ScheduleServiceTest {

    private ScheduleBlockRepository scheduleBlockRepository;
    private CourseScheduleRepository courseScheduleRepository;
    private CourseRepository courseRepository;
    private AcademicPeriodRepository academicPeriodRepository;
    private SubjectRepository subjectRepository;
    private TeacherRepository teacherRepository;
    private AuditService auditService;
    private ScheduleService service;

    @BeforeEach
    void setUp() {
        scheduleBlockRepository = mock(ScheduleBlockRepository.class);
        courseScheduleRepository = mock(CourseScheduleRepository.class);
        courseRepository = mock(CourseRepository.class);
        academicPeriodRepository = mock(AcademicPeriodRepository.class);
        subjectRepository = mock(SubjectRepository.class);
        teacherRepository = mock(TeacherRepository.class);
        auditService = mock(AuditService.class);
        service = new ScheduleService(scheduleBlockRepository, courseScheduleRepository,
                courseRepository, academicPeriodRepository, subjectRepository,
                teacherRepository, auditService);
    }

    @Test
    void getOverview_returnsNonNull() {
        when(scheduleBlockRepository.findAll()).thenReturn(java.util.List.of());
        when(courseScheduleRepository.findAll()).thenReturn(java.util.List.of());
        when(courseRepository.findAll()).thenReturn(java.util.List.of());
        var overview = service.getOverview();
        assertNotNull(overview);
    }

    @Test
    void deleteSchedule_delegates() {
        CourseSchedule schedule = new CourseSchedule();
        schedule.setId(1L);
        Course course = new Course();
        course.setName("Primero");
        schedule.setCourse(course);
        when(courseScheduleRepository.findById(1L)).thenReturn(Optional.of(schedule));
        service.deleteSchedule(1L, "admin");
        verify(courseScheduleRepository).deleteByIdDirect(1L);
        verify(auditService).log(eq("admin"), eq("DELETE"), eq("SCHEDULE"), any());
    }
}
