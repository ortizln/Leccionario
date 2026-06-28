package com.leccionario.backend.demerit.dto;

public record DemeritCategoryResponse(
        Long id,
        String code,
        String name,
        String description,
        short displayOrder,
        boolean active
) {}
