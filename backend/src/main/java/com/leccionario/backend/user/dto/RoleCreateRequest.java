package com.leccionario.backend.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.Set;

public record RoleCreateRequest(
        @NotBlank String name,
        @NotBlank String description,
        @NotNull Set<String> permissions) {
}
