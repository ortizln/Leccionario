package com.leccionario.backend.academic.dto;

import jakarta.validation.constraints.NotBlank;
public record RepresentativeRequest(
        Long studentId,
        @NotBlank String fullName,
        @NotBlank String relationship,
        @NotBlank String phone,
        String email,
        String emergencyContact,
        String emergencyPhone,
        String address) {
}
