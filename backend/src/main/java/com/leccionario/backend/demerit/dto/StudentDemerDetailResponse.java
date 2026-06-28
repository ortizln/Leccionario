package com.leccionario.backend.demerit.dto;

public record StudentDemerDetailResponse(
        Long id,
        Long faltaId,
        String faltaCode,
        String faltaDescription,
        String faltaSeverity,
        short faltaScore,
        short quantity,
        short score,
        short subtotal
) {}
