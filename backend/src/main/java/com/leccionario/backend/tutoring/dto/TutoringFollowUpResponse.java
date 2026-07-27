package com.leccionario.backend.tutoring.dto;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import lombok.Data;

@Data
public class TutoringFollowUpResponse {
    private Long id;
    private Long sessionId;
    private LocalDate followUpDate;
    private String notes;
    private String status;
    private OffsetDateTime completedAt;
}
