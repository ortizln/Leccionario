package com.leccionario.backend.demerit.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.List;

public record StudentDemerRequest(
        @NotNull Long studentId,
        @NotNull Long periodId,
        Long courseId,
        Long teacherId,
        @NotNull LocalDate logDate,
        String observation,
        @NotNull @Valid List<StudentDemerDetailRequest> details
) {}
