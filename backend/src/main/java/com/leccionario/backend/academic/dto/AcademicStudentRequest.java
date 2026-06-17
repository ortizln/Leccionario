package com.leccionario.backend.academic.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record AcademicStudentRequest(
        @NotBlank String username,
        @NotBlank @Email String email,
        @NotBlank String identification,
        @NotBlank String firstName,
        @NotBlank String lastName,
        @NotBlank String enrollmentNumber,
        @NotNull Long courseId,
        boolean enabled,
        LocalDate birthDate,
        String gender) {
}
