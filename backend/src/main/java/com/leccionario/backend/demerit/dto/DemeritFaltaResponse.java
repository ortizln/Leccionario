package com.leccionario.backend.demerit.dto;

public record DemeritFaltaResponse(
        Long id,
        Long categoryId,
        String categoryName,
        String categoryCode,
        String code,
        String description,
        short score,
        String severity,
        boolean requiresObservation,
        boolean requiresEvidence,
        boolean requiresRepresentative,
        boolean active
) {}
