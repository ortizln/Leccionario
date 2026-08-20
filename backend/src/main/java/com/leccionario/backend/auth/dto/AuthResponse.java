package com.leccionario.backend.auth.dto;

import java.util.Set;

public record AuthResponse(
        String token,
        String refreshToken,
        String username,
        String fullName,
        String primaryRole,
        String specialization,
        Long institutionId,
        String institutionCode,
        String institutionName,
        Set<String> roles,
        Set<String> permissions) {
}
