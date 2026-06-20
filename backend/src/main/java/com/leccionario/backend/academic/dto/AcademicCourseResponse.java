package com.leccionario.backend.academic.dto;

public record AcademicCourseResponse(
        Long id,
        String name,
        String parallel,
        String level,
        String section,
        String subLevel,
        Integer grade,
        Long weekStudentId,
        String weekStudentName) {
}
