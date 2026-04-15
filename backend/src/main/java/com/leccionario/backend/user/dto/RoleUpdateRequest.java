package com.leccionario.backend.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.Set;

public record RoleUpdateRequest(
        @NotBlank String description,
        @NotNull Set<String> permissions) {
}
