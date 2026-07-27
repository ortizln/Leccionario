package com.leccionario.backend.enrollment.dto;

public record EnrollmentDTO(
    Long id,
    Long studentId,
    String studentName,
    Long courseId,
    String courseName,
    Long periodId,
    String periodName,
    String enrollmentNumber,
    String parallelCode,
    String status,
    java.time.LocalDate enrollmentDate,
    java.time.LocalDate withdrawalDate,
    String observations,
    String createdBy
) {}
