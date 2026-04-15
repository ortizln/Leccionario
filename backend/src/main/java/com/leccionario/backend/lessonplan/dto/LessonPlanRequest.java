package com.leccionario.backend.lessonplan.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record LessonPlanRequest(
        @NotNull LocalDate lessonDate,
        @NotNull Long teacherId,
        @NotNull Long subjectId,
        @NotNull Long courseId,
        @NotNull Long periodId,
        @NotBlank String topic,
        @NotBlank String objective,
        @NotBlank String activities,
        @NotBlank String resources,
        String observations,
        @NotBlank String curricularSkill,
        boolean curriculumCompleted) {
}
