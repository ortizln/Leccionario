package com.leccionario.backend.bi;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class BiDashboardServiceTest {

    private JdbcTemplate jdbc;
    private BiDashboardService service;

    @BeforeEach
    void setUp() {
        jdbc = mock(JdbcTemplate.class);
        service = new BiDashboardService(jdbc);
    }

    @Test
    void courseDashboard_queriesMaterializedView() {
        when(jdbc.queryForList(anyString(), eq(1L))).thenReturn(List.of(Map.of("course_id", 1, "name", "Matematicas")));
        List<Map<String, Object>> result = service.courseDashboard(1L);
        assertEquals(1, result.size());
        assertEquals("Matematicas", result.get(0).get("name"));
    }

    @Test
    void getKPIs_returnsAllKpis() {
        when(jdbc.queryForObject(contains("COUNT(*) FROM students"), eq(Long.class), eq(1L))).thenReturn(100L);
        when(jdbc.queryForObject(contains("COUNT(*) FROM enrollments"), eq(Long.class), eq(1L))).thenReturn(95L);
        when(jdbc.queryForObject(contains("COUNT(*) FROM users"), eq(Long.class), eq(1L))).thenReturn(10L);
        when(jdbc.queryForObject(contains("COALESCE(CASE"), eq(Long.class), eq(1L))).thenReturn(92L);
        when(jdbc.queryForObject(contains("SUM(paid_amount)"), eq(BigDecimal.class), eq(1L))).thenReturn(new BigDecimal("50000"));
        when(jdbc.queryForObject(contains("SUM(amount - paid_amount)"), eq(BigDecimal.class), eq(1L))).thenReturn(new BigDecimal("10000"));
        when(jdbc.queryForObject(contains("COUNT(*) FROM assets"), eq(Long.class), eq(1L))).thenReturn(50L);
        when(jdbc.queryForObject(contains("COUNT(*) FROM book_loans"), eq(Long.class))).thenReturn(5L);

        Map<String, Object> kpis = service.getKPIs(1L);
        assertNotNull(kpis);
        assertEquals(100L, kpis.get("totalStudents"));
        assertEquals(95L, kpis.get("activeEnrollments"));
        assertEquals(10L, kpis.get("totalTeachers"));
        assertEquals(50L, kpis.get("totalAssets"));
        assertEquals(5L, kpis.get("activeLoans"));
    }

    @Test
    void getGradeDistribution_groupsByScoreRange() {
        when(jdbc.queryForList(anyString(), eq(1L))).thenReturn(List.of(
            Map.of("label", "Aprobado (7-8)", "count", 20),
            Map.of("label", "Reprobado (0-4)", "count", 5)
        ));
        Map<String, Object> result = service.getGradeDistribution(1L);
        assertNotNull(result.get("distribution"));
        assertEquals(25L, result.get("total"));
    }

    @Test
    void refreshViews_executesRefreshStatements() {
        service.refreshViews();
        verify(jdbc, times(6)).execute(contains("REFRESH MATERIALIZED VIEW"));
    }

    @Test
    void getMonthlyTrend_queriesInvoiceData() {
        when(jdbc.queryForList(anyString(), eq(1L))).thenReturn(List.of());
        List<Map<String, Object>> result = service.getMonthlyTrend(1L);
        assertNotNull(result);
    }

    @Test
    void getCommunicationStats_queriesTables() {
        when(jdbc.queryForObject(contains("COUNT(*) FROM notifications"), eq(Long.class), eq(1L))).thenReturn(25L);
        when(jdbc.queryForObject(contains("COUNT(*) FROM internal_messages"), eq(Long.class), eq(1L))).thenReturn(10L);
        when(jdbc.queryForObject(contains("COUNT(*) FROM parent_communications"), eq(Long.class), eq(1L))).thenReturn(5L);
        when(jdbc.queryForObject(contains("COUNT(*) FROM communication_groups"), eq(Long.class), eq(1L))).thenReturn(3L);
        Map<String, Object> result = service.getCommunicationStats(1L);
        assertEquals(25L, result.get("totalNotifications"));
        assertEquals(10L, result.get("totalMessages"));
        assertEquals(5L, result.get("totalParentComms"));
        assertEquals(3L, result.get("activeGroups"));
    }

    @Test
    void getConductaStats_queriesTables() {
        when(jdbc.queryForObject(contains("COUNT(*) FROM student_merits"), eq(Long.class), eq(1L))).thenReturn(30L);
        when(jdbc.queryForObject(contains("COUNT(*) FROM student_demerits"), eq(Long.class), eq(1L))).thenReturn(5L);
        when(jdbc.queryForObject(contains("COUNT(*) FROM students WHERE institution_id"), eq(Long.class), eq(1L))).thenReturn(100L);
        Map<String, Object> result = service.getConductaStats(1L);
        assertEquals(30L, result.get("merits"));
        assertEquals(5L, result.get("demerits"));
        assertEquals(100L, result.get("totalStudents"));
    }
}
