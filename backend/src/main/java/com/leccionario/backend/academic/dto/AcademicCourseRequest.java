package com.leccionario.backend.academic.dto;

import jakarta.validation.constraints.NotBlank;

public record AcademicCourseRequest(
        @NotBlank String name,
        @NotBlank String parallel,
        @NotBlank String level,
        Long weekStudentId) {
}
