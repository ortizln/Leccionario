package com.leccionario.backend.academic.dto;

import java.util.List;

public record AcademicTeacherResponse(
        Long id,
        Long userId,
        String username,
        String email,
        String identification,
        String firstName,
        String lastName,
        String fullName,
        String specialization,
        boolean enabled,
        int weeklyBlocks,
        List<String> subjects,
        List<String> courses) {
}
