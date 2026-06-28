package com.leccionario.backend.demerit.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record DemeritFaltaRequest(
        @NotNull Long categoryId,
        @NotBlank String code,
        @NotBlank String description,
        @NotNull @Min(1) @Max(100) Short score,
        String severity,
        boolean requiresObservation,
        boolean requiresEvidence,
        boolean requiresRepresentative,
        boolean active
) {}
