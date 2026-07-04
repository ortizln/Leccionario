package com.leccionario.backend.announcement.dto;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;

public record AnnouncementResponse(
        Long id,
        String title,
        String description,
        String type,
        String priority,
        LocalDate eventDate,
        LocalDate eventEndDate,
        Long courseId,
        String courseName,
        String createdByName,
        OffsetDateTime createdAt,
        int recipientCount,
        boolean read,
        List<AnnouncementScheduleItem> schedules
) {}
