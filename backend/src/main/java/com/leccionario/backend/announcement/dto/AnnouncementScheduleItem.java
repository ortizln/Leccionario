package com.leccionario.backend.announcement.dto;

import java.time.LocalDate;

public record AnnouncementScheduleItem(
        Long scheduleBlockId,
        String blockLabel,
        String startTime,
        String endTime,
        String scheduleDate,
        short weekday,
        String weekdayLabel
) {
    public static final String[] WEEKDAY_NAMES = {
        "", "Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado"
    };

    public static String weekdayLabel(short weekday) {
        if (weekday >= 1 && weekday <= 6) return WEEKDAY_NAMES[weekday];
        return "";
    }

    public static short weekdayFromDate(LocalDate date) {
        if (date == null) return 0;
        return (short) date.getDayOfWeek().getValue();
    }
}
