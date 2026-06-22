package com.leccionario.backend.self.dto;

import java.time.LocalDate;
import java.util.List;

public record WeeklyJournalDayResponse(
        int weekday,
        String weekdayLabel,
        LocalDate logDate,
        List<JournalEntryResponse> entries) {
}
