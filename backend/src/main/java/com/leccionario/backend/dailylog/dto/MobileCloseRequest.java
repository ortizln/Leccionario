package com.leccionario.backend.dailylog.dto;

import jakarta.validation.constraints.NotBlank;

public record MobileCloseRequest(
        @NotBlank String username,
        @NotBlank String code,
        String notes) {
}
