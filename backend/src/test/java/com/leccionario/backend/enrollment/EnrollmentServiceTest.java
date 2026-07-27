package com.leccionario.backend.enrollment;

import com.leccionario.backend.enrollment.dto.EnrollmentDTO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class EnrollmentServiceTest {

    private EnrollmentRepository enrollmentRepository;
    private EnrollmentService service;

    @BeforeEach
    void setUp() {
        enrollmentRepository = mock(EnrollmentRepository.class);
        service = new EnrollmentService(enrollmentRepository);
    }

    @Test
    void create_savesAndReturnsDTO() {
        Enrollment e = new Enrollment();
        e.setStudentId(10L);
        e.setCourseId(5L);
        e.setPeriodId(1L);
        e.setEnrollmentNumber("E-2024-001");
        e.setStatus("ACTIVA");
        when(enrollmentRepository.save(any())).thenAnswer(inv -> {
            Enrollment saved = inv.getArgument(0);
            saved.setId(1L);
            return saved;
        });
        EnrollmentDTO result = service.create(e, "admin");
        assertNotNull(result);
        assertEquals("ACTIVA", result.status());
    }

    @Test
    void findById_throwsWhenNotFound() {
        when(enrollmentRepository.findById(99L)).thenReturn(Optional.empty());
        assertThrows(RuntimeException.class, () -> service.findById(99L));
    }

    @Test
    void findByPeriod_delegatesToRepository() {
        when(enrollmentRepository.findByPeriodIdOrderByEnrollmentNumberDesc(1L)).thenReturn(List.of());
        List<EnrollmentDTO> result = service.findByPeriod(1L);
        assertNotNull(result);
        assertTrue(result.isEmpty());
    }

    @Test
    void update_modifiesExisting() {
        Enrollment existing = new Enrollment();
        existing.setId(1L);
        existing.setStatus("ACTIVA");
        Enrollment updates = new Enrollment();
        updates.setStatus("RETIRADA");
        when(enrollmentRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(enrollmentRepository.save(any())).thenReturn(existing);
        EnrollmentDTO result = service.update(1L, updates);
        assertEquals("RETIRADA", existing.getStatus());
    }

    @Test
    void getStats_returnsCounts() {
        when(enrollmentRepository.countActiveByPeriod(1L)).thenReturn(50L);
        when(enrollmentRepository.findByPeriodIdOrderByEnrollmentNumberDesc(1L)).thenReturn(List.of());
        Map<String, Object> stats = service.getStats(1L);
        assertEquals(50L, stats.get("active"));
        assertEquals(0L, stats.get("total"));
    }
}
