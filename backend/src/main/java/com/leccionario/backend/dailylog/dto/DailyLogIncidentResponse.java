package com.leccionario.backend.dailylog.dto;

public record DailyLogIncidentResponse(
        Long id,
        Long studentId,
        String studentName,
        String enrollmentNumber,
        Long demeritId,
        String demeritCode,
        String demeritCategory,
        String demeritDescription,
        Short demeritScore,
        String category,
        String notes) {
}
