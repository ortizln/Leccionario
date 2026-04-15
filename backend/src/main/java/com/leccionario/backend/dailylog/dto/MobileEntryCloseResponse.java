package com.leccionario.backend.dailylog.dto;

public record MobileEntryCloseResponse(
        String closeToken,
        String courseName,
        String logDate,
        String scheduleLabel,
        String subjectName,
        String teacherName,
        String teacherSignatureStatus,
        String teacherClosedAt) {
}
