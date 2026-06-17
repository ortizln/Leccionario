package com.leccionario.backend.academic.dto;

import java.time.LocalDate;

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
        String enrollmentNumber,
        LocalDate birthDate,
        String gender) {
}
