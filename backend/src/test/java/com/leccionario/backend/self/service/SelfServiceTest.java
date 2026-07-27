package com.leccionario.backend.self.service;

import com.leccionario.backend.common.exception.BusinessException;
import com.leccionario.backend.user.domain.User;
import com.leccionario.backend.user.repository.UserRepository;
import com.leccionario.backend.user.domain.Student;
import com.leccionario.backend.user.repository.StudentRepository;
import com.leccionario.backend.user.domain.Teacher;
import com.leccionario.backend.user.repository.TeacherRepository;
import com.leccionario.backend.schedule.repository.CourseScheduleRepository;
import com.leccionario.backend.academic.repository.AcademicPeriodRepository;
import com.leccionario.backend.schedule.repository.ScheduleBlockRepository;
import com.leccionario.backend.dailylog.repository.DailyLogRepository;
import com.leccionario.backend.dailylog.repository.DailyLogSignatureRepository;
import com.leccionario.backend.academic.repository.CourseRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class SelfServiceTest {

    private UserRepository userRepository;
    private StudentRepository studentRepository;
    private TeacherRepository teacherRepository;
    private CourseScheduleRepository courseScheduleRepository;
    private AcademicPeriodRepository academicPeriodRepository;
    private ScheduleBlockRepository scheduleBlockRepository;
    private DailyLogRepository dailyLogRepository;
    private DailyLogSignatureRepository dailyLogSignatureRepository;
    private CourseRepository courseRepository;
    private SelfService service;

    @BeforeEach
    void setUp() {
        userRepository = mock(UserRepository.class);
        studentRepository = mock(StudentRepository.class);
        teacherRepository = mock(TeacherRepository.class);
        courseScheduleRepository = mock(CourseScheduleRepository.class);
        academicPeriodRepository = mock(AcademicPeriodRepository.class);
        scheduleBlockRepository = mock(ScheduleBlockRepository.class);
        dailyLogRepository = mock(DailyLogRepository.class);
        dailyLogSignatureRepository = mock(DailyLogSignatureRepository.class);
        courseRepository = mock(CourseRepository.class);
        service = new SelfService(userRepository, studentRepository, teacherRepository,
                courseScheduleRepository, academicPeriodRepository, scheduleBlockRepository,
                dailyLogRepository, dailyLogSignatureRepository, courseRepository);
    }

    @Test
    void findStudentByUsername_found() {
        User user = new User();
        user.setId(1L);
        when(userRepository.findByUsername("est1")).thenReturn(Optional.of(user));
        Student student = new Student();
        when(studentRepository.findByUserId(1L)).thenReturn(Optional.of(student));
        assertEquals(student, service.findStudentByUsername("est1"));
    }

    @Test
    void findStudentByUsername_userNotFound_throws() {
        when(userRepository.findByUsername("no")).thenReturn(Optional.empty());
        assertThrows(BusinessException.class, () -> service.findStudentByUsername("no"));
    }

    @Test
    void findStudentByUsername_noProfile_throws() {
        User user = new User();
        user.setId(1L);
        when(userRepository.findByUsername("est1")).thenReturn(Optional.of(user));
        when(studentRepository.findByUserId(1L)).thenReturn(Optional.empty());
        assertThrows(BusinessException.class, () -> service.findStudentByUsername("est1"));
    }

    @Test
    void findTeacherByUsername_found() {
        User user = new User();
        user.setId(2L);
        when(userRepository.findByUsername("doc1")).thenReturn(Optional.of(user));
        Teacher teacher = new Teacher();
        when(teacherRepository.findByUserId(2L)).thenReturn(Optional.of(teacher));
        assertEquals(teacher, service.findTeacherByUsername("doc1"));
    }

    @Test
    void findTeacherByUsername_userNotFound_throws() {
        when(userRepository.findByUsername("no")).thenReturn(Optional.empty());
        assertThrows(BusinessException.class, () -> service.findTeacherByUsername("no"));
    }

    @Test
    void findTeacherByUsername_noProfile_throws() {
        User user = new User();
        user.setId(2L);
        when(userRepository.findByUsername("doc1")).thenReturn(Optional.of(user));
        when(teacherRepository.findByUserId(2L)).thenReturn(Optional.empty());
        assertThrows(BusinessException.class, () -> service.findTeacherByUsername("doc1"));
    }
}
