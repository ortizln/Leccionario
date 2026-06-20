package com.leccionario.backend.academic.dto;

import java.time.LocalDate;

public record WeekStudentAssignmentResponse(
        Long id,
        Long courseId,
        Long studentId,
        String studentName,
        String enrollmentNumber,
        LocalDate startDate,
        LocalDate endDate) {
}
