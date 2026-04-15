package com.leccionario.backend.schedule.dto;

import com.leccionario.backend.schedule.domain.ScheduleBlockType;
import java.time.LocalTime;

public record ScheduleBlockResponse(
        Long id,
        String label,
        LocalTime startTime,
        LocalTime endTime,
        int blockOrder,
        ScheduleBlockType blockType,
        boolean active) {
}
