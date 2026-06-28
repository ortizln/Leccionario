package com.leccionario.backend.demerit.dto;

import jakarta.validation.constraints.NotBlank;

public record DemeritCategoryRequest(
        @NotBlank String code,
        @NotBlank String name,
        String description,
        short displayOrder,
        boolean active
) {}
