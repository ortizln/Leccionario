package com.leccionario.backend.dailylog.dto;

import java.util.List;

public record MobileTodayResponse(
        String username,
        String fullName,
        String workDate,
        List<MobileTodayEntryResponse> entries) {
}
