package com.leccionario.backend.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.Set;

public record UserUpdateRequest(
        @NotBlank String username,
        @Email String email,
        String password,
        @NotBlank String identification,
        @NotBlank String firstName,
        @NotBlank String lastName,
        @NotNull Long institutionId,
        boolean enabled,
        @NotNull Set<String> roles) {
}
