package com.leccionario.backend.report.dto;

public record DashboardMetricsResponse(
        long totalUsers,
        long totalTeachers,
        long totalStudents,
        long totalLessonPlans,
        long totalEvaluations) {
}
