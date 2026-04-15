package com.leccionario.backend.schedule.domain;

public final class Weekday {

    private static final String[] LABELS = {
            "",
            "Lunes",
            "Martes",
            "Miercoles",
            "Jueves",
            "Viernes",
            "Sabado",
            "Domingo"
    };

    private Weekday() {
    }

    public static String label(short weekday) {
        if (weekday < 1 || weekday > 7) {
            return "Dia " + weekday;
        }
        return LABELS[weekday];
    }
}
