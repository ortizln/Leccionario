package com.leccionario.backend.academic.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record AcademicYearRequest(
        @NotNull @Min(2020) int year,
        boolean active) {
}
