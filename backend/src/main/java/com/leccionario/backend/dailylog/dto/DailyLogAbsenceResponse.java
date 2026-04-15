package com.leccionario.backend.dailylog.dto;

public record DailyLogAbsenceResponse(
        Long id,
        Long studentId,
        String studentName,
        String enrollmentNumber,
        String absenceType,
        String notes) {
}
