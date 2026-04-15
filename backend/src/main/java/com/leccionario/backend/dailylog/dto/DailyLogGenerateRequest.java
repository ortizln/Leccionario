package com.leccionario.backend.dailylog.dto;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record DailyLogGenerateRequest(
        @NotNull Long courseId,
        @NotNull Long periodId,
        @NotNull LocalDate logDate,
        Integer workDayNumber,
        String city,
        String generalNotes) {
}
