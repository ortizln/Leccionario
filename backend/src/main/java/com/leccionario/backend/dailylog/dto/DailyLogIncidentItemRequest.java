package com.leccionario.backend.dailylog.dto;

import jakarta.validation.constraints.NotNull;

public record DailyLogIncidentItemRequest(
        @NotNull Long studentId,
        Long demeritId,
        String category,
        String notes) {
}
