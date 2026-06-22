package com.leccionario.backend.dailylog.dto;

public record DailyLogEntryResponse(
        Long id,
        Long scheduleBlockId,
        String scheduleLabel,
        String blockType,
        String startTime,
        String endTime,
        Long teacherId,
        String teacherName,
        Long subjectId,
        String subjectName,
        String didacticUnit,
        String topic,
        String closeToken,
        String teacherSignatureStatus,
        String teacherClosedAt,
        String specificNotes,
        String generalNotes,
        java.util.List<DailyLogAbsenceResponse> absences,
        java.util.List<DailyLogIncidentResponse> incidents) {
}
