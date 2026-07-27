package com.leccionario.backend.attendance.service;

import com.leccionario.backend.dailylog.domain.DailyLogStudentAbsence;
import com.leccionario.backend.dailylog.repository.DailyLogStudentAbsenceRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class AttendanceServiceTest {

    private DailyLogStudentAbsenceRepository absenceRepository;
    private AttendanceService service;

    @BeforeEach
    void setUp() {
        absenceRepository = mock(DailyLogStudentAbsenceRepository.class);
        service = new AttendanceService(absenceRepository);
    }

    @Test
    void getCourseAttendanceStats_returnsStats() {
        when(absenceRepository.countByCourseAndPeriod(1L, 1L)).thenReturn(10L);
        when(absenceRepository.countByTypeForCourseAndPeriod(1L, 1L)).thenReturn(List.of(
            new Object[]{"ABSENT", 5L},
            new Object[]{"LATE", 3L},
            new Object[]{"JUSTIFIED", 2L}
        ));
        when(absenceRepository.findByCourseAndPeriod(1L, 1L)).thenReturn(List.of());

        Map<String, Object> stats = service.getCourseAttendanceStats(1L, 1L);
        assertEquals(10L, stats.get("totalAbsences"));
        assertNotNull(stats.get("byType"));
    }

    @Test
    void getStudentAttendanceStats_returnsStats() {
        when(absenceRepository.countByStudentAndPeriod(10L, 1L)).thenReturn(8L);
        when(absenceRepository.countByTypeForStudentAndPeriod(10L, 1L)).thenReturn(List.of(
            new Object[]{"ABSENT", 4L},
            new Object[]{"LATE", 2L},
            new Object[]{"JUSTIFIED", 2L}
        ));

        Map<String, Object> stats = service.getStudentAttendanceStats(10L, 1L);
        assertEquals(8L, stats.get("totalAbsences"));
        assertEquals(6L, stats.get("unjustifiedAbsences"));
    }

    @Test
    void getStudentAttendance_returnsEmptyList() {
        when(absenceRepository.findByStudentAndPeriod(10L, 1L)).thenReturn(List.of());
        List<Map<String, Object>> result = service.getStudentAttendance(10L, 1L);
        assertNotNull(result);
        assertTrue(result.isEmpty());
    }

    @Test
    void getCourseAttendanceByStudent_groupsByStudent() {
        when(absenceRepository.findByCourseAndPeriod(1L, 1L)).thenReturn(List.of());
        List<Map<String, Object>> result = service.getCourseAttendanceByStudent(1L, 1L);
        assertNotNull(result);
    }
}
