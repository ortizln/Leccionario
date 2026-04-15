package com.leccionario.backend.user.dto;

import java.util.Set;

public record RoleResponse(
        String name,
        String description,
        Set<String> permissions) {
}
