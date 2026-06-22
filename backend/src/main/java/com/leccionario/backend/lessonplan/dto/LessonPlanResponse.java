package com.leccionario.backend.lessonplan.dto;

import java.time.LocalDate;

public record LessonPlanResponse(
        Long id,
        LocalDate lessonDate,
        String teacher,
        String subject,
        String course,
        String topic,
        String objective,
        boolean curriculumCompleted) {
}
