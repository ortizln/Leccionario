package com.leccionario.backend.demerit.service;

import com.leccionario.backend.audit.service.AuditService;
import com.leccionario.backend.common.exception.ResourceNotFoundException;
import com.leccionario.backend.demerit.domain.*;
import com.leccionario.backend.demerit.repository.*;
import com.leccionario.backend.academic.domain.AcademicPeriod;
import com.leccionario.backend.academic.domain.Course;
import com.leccionario.backend.academic.repository.AcademicPeriodRepository;
import com.leccionario.backend.user.domain.Student;
import com.leccionario.backend.user.repository.StudentRepository;
import com.leccionario.backend.user.domain.Teacher;
import com.leccionario.backend.user.repository.TeacherRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class StudentDemerServiceTest {

    private StudentDemerRepository repository;
    private StudentDemerDetailRepository detailRepository;
    private DemeritEvidenceRepository evidenceRepository;
    private DemeritStatusHistoryRepository historyRepository;
    private DemeritFaltaRepository faltaRepository;
    private StudentRepository studentRepository;
    private TeacherRepository teacherRepository;
    private AcademicPeriodRepository periodRepository;
    private AuditService auditService;
    private StudentDemerService service;

    @BeforeEach
    void setUp() {
        repository = mock(StudentDemerRepository.class);
        detailRepository = mock(StudentDemerDetailRepository.class);
        evidenceRepository = mock(DemeritEvidenceRepository.class);
        historyRepository = mock(DemeritStatusHistoryRepository.class);
        faltaRepository = mock(DemeritFaltaRepository.class);
        studentRepository = mock(StudentRepository.class);
        teacherRepository = mock(TeacherRepository.class);
        periodRepository = mock(AcademicPeriodRepository.class);
        auditService = mock(AuditService.class);
        service = new StudentDemerService(repository, detailRepository, evidenceRepository,
                historyRepository, faltaRepository, studentRepository, teacherRepository,
                periodRepository, auditService);
    }

    @Test
    void findByStudentAndPeriod_delegates() {
        when(repository.findByStudentIdAndPeriodIdOrderByLogDateDesc(1L, 1L)).thenReturn(List.of());
        assertTrue(service.findByStudentAndPeriod(1L, 1L).isEmpty());
    }

    @Test
    void findByCourseAndPeriod_delegates() {
        when(repository.findByCourseIdAndPeriodIdOrderByLogDateDesc(1L, 1L)).thenReturn(List.of());
        assertTrue(service.findByCourseAndPeriod(1L, 1L).isEmpty());
    }

    @Test
    void findByTeacherAndPeriod_delegates() {
        when(repository.findByTeacherIdAndPeriodIdOrderByLogDateDesc(1L, 1L)).thenReturn(List.of());
        assertTrue(service.findByTeacherAndPeriod(1L, 1L).isEmpty());
    }

    @Test
    void findByStudentAll_delegates() {
        when(repository.findByStudentIdOrderByLogDateDesc(1L)).thenReturn(List.of());
        assertTrue(service.findByStudentAll(1L).isEmpty());
    }

    @Test
    void delete_found() {
        StudentDemer d = new StudentDemer();
        d.setId(1L);
        when(repository.findById(1L)).thenReturn(Optional.of(d));
        service.delete(1L, "admin");
        verify(repository).delete(d);
        verify(auditService).log(eq("admin"), eq("DELETE"), eq("STUDENT_DEMER"), any());
    }

    @Test
    void delete_notFound_throws() {
        when(repository.findById(1L)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> service.delete(1L, "admin"));
    }
}
