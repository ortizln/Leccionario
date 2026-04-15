package com.leccionario.backend.academic.dto;

import java.time.LocalDate;

public record AcademicPeriodResponse(
        Long id,
        String name,
        LocalDate startDate,
        LocalDate endDate,
        boolean active) {
}
