package com.leccionario.backend.tutoring.service;

import com.leccionario.backend.common.exception.ResourceNotFoundException;
import com.leccionario.backend.tutoring.domain.TutoringSession;
import com.leccionario.backend.tutoring.domain.TutoringFollowUp;
import com.leccionario.backend.tutoring.dto.TutoringSessionRequest;
import com.leccionario.backend.tutoring.repository.TutoringSessionRepository;
import com.leccionario.backend.tutoring.repository.TutoringFollowUpRepository;
import com.leccionario.backend.user.domain.Student;
import com.leccionario.backend.user.domain.User;
import com.leccionario.backend.user.repository.StudentRepository;
import com.leccionario.backend.user.domain.Teacher;
import com.leccionario.backend.academic.domain.Course;
import com.leccionario.backend.academic.domain.AcademicPeriod;
import com.leccionario.backend.institution.domain.Institution;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class TutoringServiceTest {

    private TutoringSessionRepository sessionRepository;
    private TutoringFollowUpRepository followUpRepository;
    private StudentRepository studentRepository;
    private TutoringService service;

    @BeforeEach
    void setUp() {
        sessionRepository = mock(TutoringSessionRepository.class);
        followUpRepository = mock(TutoringFollowUpRepository.class);
        studentRepository = mock(StudentRepository.class);
        service = new TutoringService(sessionRepository, followUpRepository, studentRepository);
    }

    private User createUser(String first, String last) {
        User u = new User();
        u.setFirstName(first);
        u.setLastName(last);
        return u;
    }

    private TutoringSession buildSession() {
        TutoringSession session = new TutoringSession();
        session.setId(1L);
        Institution inst = new Institution();
        inst.setId(1L);
        session.setInstitution(inst);
        Teacher teacher = new Teacher();
        teacher.setId(1L);
        teacher.setUser(createUser("Docente", "Uno"));
        session.setTeacher(teacher);
        Student student = new Student();
        student.setId(1L);
        student.setUser(createUser("Estudiante", "Uno"));
        student.setEnrollmentNumber("E001");
        session.setStudent(student);
        Course course = new Course();
        course.setId(1L);
        course.setName("Primero");
        session.setCourse(course);
        AcademicPeriod period = new AcademicPeriod();
        period.setId(1L);
        period.setName("2026-A");
        session.setAcademicPeriod(period);
        session.setSessionDate(java.time.LocalDate.now());
        session.setSessionType("INDIVIDUAL");
        session.setStatus("CREADO");
        session.setTopic("Matematicas");
        return session;
    }

    @Test
    void createSession_saves() {
        Student student = new Student();
        student.setId(1L);
        when(studentRepository.findById(1L)).thenReturn(Optional.of(student));
        when(sessionRepository.save(any())).thenAnswer(inv -> {
            TutoringSession s = inv.getArgument(0);
            s.setId(1L);
            s.getTeacher().setUser(createUser("Docente", "Dos"));
            s.getStudent().setUser(createUser("Estudiante", "Uno"));
            s.getStudent().setEnrollmentNumber("E001");
            s.getCourse().setName("Segundo");
            s.getAcademicPeriod().setName("2026-B");
            return s;
        });

        TutoringSessionRequest req = new TutoringSessionRequest();
        req.setStudentId(1L);
        req.setCourseId(10L);
        req.setAcademicPeriodId(5L);
        req.setInstitutionId(1L);
        req.setTeacherId(2L);
        req.setSessionDate("2026-01-15");
        req.setSessionType("INDIVIDUAL");
        req.setTopic("Matematicas");

        var result = service.createSession(req, "admin");
        assertNotNull(result);
        verify(sessionRepository).save(any());
    }

    @Test
    void createSession_studentNotFound_throws() {
        when(studentRepository.findById(1L)).thenReturn(Optional.empty());
        TutoringSessionRequest req = new TutoringSessionRequest();
        req.setStudentId(1L);
        req.setCourseId(10L);
        req.setAcademicPeriodId(5L);
        req.setInstitutionId(1L);
        req.setTeacherId(2L);
        assertThrows(ResourceNotFoundException.class, () -> service.createSession(req, "admin"));
    }

    @Test
    void getSessionsByStudent_delegates() {
        when(sessionRepository.findByStudentIdAndAcademicPeriodId(1L, 1L)).thenReturn(List.of());
        assertTrue(service.getSessionsByStudent(1L, 1L).isEmpty());
    }

    @Test
    void getSessionsByCourse_delegates() {
        when(sessionRepository.findByCourseIdAndAcademicPeriodId(1L, 1L)).thenReturn(List.of());
        assertTrue(service.getSessionsByCourse(1L, 1L).isEmpty());
    }

    @Test
    void getSessionsByTeacher_delegates() {
        when(sessionRepository.findByTeacherIdAndAcademicPeriodId(1L, 1L)).thenReturn(List.of());
        assertTrue(service.getSessionsByTeacher(1L, 1L).isEmpty());
    }

    @Test
    void getSession_found() {
        TutoringSession session = buildSession();
        when(sessionRepository.findById(1L)).thenReturn(Optional.of(session));
        when(followUpRepository.findBySessionId(1L)).thenReturn(List.of());
        assertNotNull(service.getSession(1L));
    }

    @Test
    void getSession_notFound_throws() {
        when(sessionRepository.findById(1L)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> service.getSession(1L));
    }

    @Test
    void updateStatus_found() {
        TutoringSession session = buildSession();
        when(sessionRepository.findById(1L)).thenReturn(Optional.of(session));
        when(sessionRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(followUpRepository.findBySessionId(1L)).thenReturn(List.of());
        var result = service.updateStatus(1L, "COMPLETADA");
        assertEquals("COMPLETADA", result.getStatus());
    }

    @Test
    void updateStatus_notFound_throws() {
        when(sessionRepository.findById(1L)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> service.updateStatus(1L, "COMPLETADA"));
    }
}
