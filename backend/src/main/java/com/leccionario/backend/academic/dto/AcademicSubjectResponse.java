package com.leccionario.backend.academic.dto;

public record AcademicSubjectResponse(
        Long id,
        String name,
        String code,
        String curriculumArea) {
}
