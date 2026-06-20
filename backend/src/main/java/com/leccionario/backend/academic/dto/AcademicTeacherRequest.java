package com.leccionario.backend.academic.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import java.util.List;

public record AcademicTeacherRequest(
        @NotBlank String username,
        @NotBlank @Email String email,
        @NotBlank String identification,
        @NotBlank String firstName,
        @NotBlank String lastName,
        @NotBlank String specialization,
        boolean enabled,
        List<String> subjects,
        List<String> courses) {
}
