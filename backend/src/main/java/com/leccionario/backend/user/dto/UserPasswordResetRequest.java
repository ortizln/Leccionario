package com.leccionario.backend.user.dto;

import jakarta.validation.constraints.NotBlank;

public record UserPasswordResetRequest(
        @NotBlank String password) {
}
