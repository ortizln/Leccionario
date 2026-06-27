package com.leccionario.backend.academic.dto;

import jakarta.validation.constraints.NotBlank;

public record AcademicCourseRequest(
        @NotBlank String name,
        @NotBlank String parallel,
        @NotBlank String level,
        String section,
        String subLevel,
        Integer grade,
        Long weekStudentId,
        Long academicYearId,
        Long schoolDayId,
        Long schoolModalityId,
        Integer capacity) {
}
