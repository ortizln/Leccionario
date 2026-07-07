package com.leccionario.backend.announcement.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.List;

public record AnnouncementRequest(
        @NotBlank(message = "El titulo es obligatorio.") String title,
        @NotBlank(message = "La descripcion es obligatoria.") String description,
        @NotNull(message = "El tipo de anuncio es obligatorio.") String type,
        String priority,
        LocalDate eventDate,
        LocalDate eventEndDate,
        Long courseId,
        List<ScheduleBlockRef> schedules
) {
    public record ScheduleBlockRef(String scheduleDate, Long scheduleBlockId) {}
}
