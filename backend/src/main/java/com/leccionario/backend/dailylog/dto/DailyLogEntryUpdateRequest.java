package com.leccionario.backend.dailylog.dto;

public record DailyLogEntryUpdateRequest(
        String didacticUnit,
        String topic,
        String specificNotes,
        String generalNotes,
        boolean signed) {
}
