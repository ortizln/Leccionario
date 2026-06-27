package com.leccionario.backend.academic.dto;

import jakarta.validation.constraints.NotBlank;

public record SchoolDayRequest(
        @NotBlank String name,
        boolean active) {
}
