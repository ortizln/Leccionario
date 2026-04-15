package com.leccionario.backend.schedule.dto;

import com.leccionario.backend.schedule.domain.ScheduleBlockType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalTime;

public record ScheduleBlockRequest(
        @NotBlank String label,
        @NotNull LocalTime startTime,
        @NotNull LocalTime endTime,
        int blockOrder,
        @NotNull ScheduleBlockType blockType,
        boolean active) {
}
