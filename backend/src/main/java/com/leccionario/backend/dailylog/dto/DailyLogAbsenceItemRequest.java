package com.leccionario.backend.dailylog.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record DailyLogAbsenceItemRequest(
        @NotNull Long studentId,
        @NotBlank String absenceType,
        String notes) {
}
