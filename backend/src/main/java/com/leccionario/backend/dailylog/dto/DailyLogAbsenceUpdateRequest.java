package com.leccionario.backend.dailylog.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public record DailyLogAbsenceUpdateRequest(
        @NotNull @Valid List<DailyLogAbsenceItemRequest> absences) {
}
