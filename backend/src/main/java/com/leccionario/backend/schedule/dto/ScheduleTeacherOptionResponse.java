package com.leccionario.backend.schedule.dto;

import java.util.List;

public record ScheduleTeacherOptionResponse(
        Long id,
        String name,
        String specialization,
        List<Long> subjectIds) {
}
