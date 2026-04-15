package com.leccionario.backend.dailylog.dto;

public record MobileLogCloseResponse(
        String closeToken,
        String courseName,
        String logDate,
        String status,
        String closedAt) {
}
