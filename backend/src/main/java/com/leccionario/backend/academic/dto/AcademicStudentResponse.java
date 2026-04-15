package com.leccionario.backend.academic.dto;

public record AcademicStudentResponse(
        Long id,
        Long userId,
        String username,
        String identification,
        String firstName,
        String lastName,
        String fullName,
        String email,
        boolean enabled,
        Long courseId,
        String courseName,
        String enrollmentNumber) {
}
