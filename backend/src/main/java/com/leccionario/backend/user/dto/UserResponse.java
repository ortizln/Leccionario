package com.leccionario.backend.user.dto;

import java.util.Set;

public record UserResponse(
        Long id,
        String username,
        String email,
        String identification,
        String firstName,
        String lastName,
        boolean enabled,
        Long institutionId,
        String institutionName,
        String specialization,
        Set<String> roles) {
}
