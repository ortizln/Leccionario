package com.leccionario.backend.self.dto;

import java.time.LocalDate;
import java.util.List;

public record WeeklyJournalResponse(
        String teacherName,
        String periodName,
        LocalDate weekStart,
        List<WeeklyJournalDayResponse> days) {
}
