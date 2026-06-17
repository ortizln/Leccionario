package com.leccionario.backend.academic.dto;

import jakarta.validation.constraints.NotBlank;

public record AcademicSubjectRequest(
        @NotBlank String name,
        @NotBlank String code,
        String curriculumArea) {
}
