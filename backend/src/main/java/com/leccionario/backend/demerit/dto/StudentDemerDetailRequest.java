package com.leccionario.backend.demerit.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record StudentDemerDetailRequest(
        @NotNull Long faltaId,
        @NotNull @Min(1) Short quantity
) {}
