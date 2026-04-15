package com.leccionario.backend.academic.dto;

public record AcademicCourseResponse(
        Long id,
        String name,
        String parallel,
        String level,
        Long weekStudentId,
        String weekStudentName) {
}
