package com.leccionario.backend.schedule.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record CourseScheduleRequest(
        @NotNull Long courseId,
        @NotNull Long periodId,
        @NotNull Long scheduleBlockId,
        @NotNull Long subjectId,
        @NotNull Long teacherId,
        @Min(1) @Max(7) short weekday,
        String classroom) {
}
