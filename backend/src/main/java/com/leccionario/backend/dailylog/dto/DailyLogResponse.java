package com.leccionario.backend.dailylog.dto;

import java.time.LocalDate;
import java.util.List;

public record DailyLogResponse(
        Long id,
        Long courseId,
        String courseName,
        Long periodId,
        String periodName,
        Long institutionId,
        String institutionName,
        Integer workDayNumber,
        LocalDate logDate,
        String city,
        String generalNotes,
        String closeToken,
        String status,
        String closedAt,
        List<DailyLogSignatureResponse> signatures,
        List<DailyLogStudentOptionResponse> students,
        List<DailyLogEntryResponse> entries) {
}
