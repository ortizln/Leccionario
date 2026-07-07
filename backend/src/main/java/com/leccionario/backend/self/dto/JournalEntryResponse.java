package com.leccionario.backend.self.dto;

public record JournalEntryResponse(
        Long dailyLogId,
        Long entryId,
        Long scheduleBlockId,
        String courseName,
        String scheduleLabel,
        String startTime,
        String endTime,
        String subjectName,
        String teacherName,
        String blockType,
        String didacticUnit,
        String topic,
        String specificNotes,
        String generalNotes,
        String teacherSignatureStatus,
        String closeToken) {
}
