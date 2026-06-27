package com.leccionario.backend.academic.dto;

import jakarta.validation.constraints.NotBlank;

public record SchoolModalityRequest(
        @NotBlank String name,
        boolean active) {
}
