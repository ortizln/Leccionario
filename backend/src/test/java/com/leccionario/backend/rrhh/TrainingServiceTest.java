package com.leccionario.backend.rrhh;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class TrainingServiceTest {

    private TrainingCourseRepository courseRepository;
    private TrainingEnrollmentRepository enrollmentRepository;
    private TrainingService service;

    @BeforeEach
    void setUp() {
        courseRepository = mock(TrainingCourseRepository.class);
        enrollmentRepository = mock(TrainingEnrollmentRepository.class);
        service = new TrainingService(courseRepository, enrollmentRepository);
    }

    @Test
    void createCourse_savesAndReturns() {
        TrainingCourse course = new TrainingCourse();
        course.setName("Leadership");
        when(courseRepository.save(course)).thenReturn(course);
        assertEquals("Leadership", service.createCourse(course).getName());
    }

    @Test
    void findCourseById_found() {
        TrainingCourse course = new TrainingCourse();
        course.setId(1L);
        when(courseRepository.findById(1L)).thenReturn(Optional.of(course));
        assertEquals(1L, service.findCourseById(1L).getId());
    }

    @Test
    void findCourseById_notFound_throws() {
        when(courseRepository.findById(1L)).thenReturn(Optional.empty());
        assertThrows(RuntimeException.class, () -> service.findCourseById(1L));
    }

    @Test
    void updateCourse_found() {
        TrainingCourse existing = new TrainingCourse();
        existing.setId(1L);
        existing.setName("Old");
        when(courseRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(courseRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        TrainingCourse updates = new TrainingCourse();
        updates.setName("New");
        updates.setDescription("Desc");

        TrainingCourse result = service.updateCourse(1L, updates);
        assertEquals("New", result.getName());
    }

    @Test
    void deleteCourse_delegatesToRepository() {
        service.deleteCourse(1L);
        verify(courseRepository).deleteById(1L);
    }

    @Test
    void findCourses_delegatesToRepository() {
        when(courseRepository.findByInstitutionIdOrderByStartDateDesc(1L)).thenReturn(List.of());
        assertTrue(service.findCourses(1L).isEmpty());
    }

    @Test
    void findActiveCourses_filtersByStatus() {
        when(courseRepository.findByInstitutionIdAndStatusOrderByStartDateDesc(1L, "EN_CURSO")).thenReturn(List.of());
        assertTrue(service.findActiveCourses(1L).isEmpty());
    }

    @Test
    void enrollEmployee_savesEnrollment() {
        when(enrollmentRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        TrainingEnrollment result = service.enrollEmployee(1L, 10L);
        assertNotNull(result);
        assertEquals(1L, result.getCourseId());
        assertEquals(10L, result.getEmployeeId());
    }

    @Test
    void completeEnrollment_setsGradeAndStatus() {
        TrainingEnrollment enrollment = new TrainingEnrollment();
        enrollment.setStatus("INSCRITO");
        when(enrollmentRepository.findById(1L)).thenReturn(Optional.of(enrollment));
        when(enrollmentRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        TrainingEnrollment result = service.completeEnrollment(1L, new BigDecimal("8.50"));
        assertEquals("COMPLETADO", result.getStatus());
        assertEquals(new BigDecimal("8.50"), result.getGrade());
    }

    @Test
    void findEnrollmentsByEmployee_delegatesToRepository() {
        when(enrollmentRepository.findByEmployeeIdOrderByEnrollmentDateDesc(1L)).thenReturn(List.of());
        assertTrue(service.findEnrollmentsByEmployee(1L).isEmpty());
    }

    @Test
    void findEnrollmentsByCourse_filtersByStatus() {
        when(enrollmentRepository.findByCourseIdAndStatus(1L, "INSCRITO")).thenReturn(List.of());
        assertTrue(service.findEnrollmentsByCourse(1L).isEmpty());
    }
}
