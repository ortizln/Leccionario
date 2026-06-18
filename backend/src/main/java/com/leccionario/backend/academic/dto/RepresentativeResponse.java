package com.leccionario.backend.academic.dto;

public record RepresentativeResponse(
        Long id,
        Long studentId,
        String studentName,
        String enrollmentNumber,
        String fullName,
        String relationship,
        String phone,
        String email,
        String emergencyContact,
        String emergencyPhone,
        String address) {
}
