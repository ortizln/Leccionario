package com.leccionario.backend.evaluation.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import lombok.Data;

@Data
public class EvaluationTypeResponse {
    private Long id;
    private Long institutionId;
    private String name;
    private String code;
    private String description;
    private BigDecimal weightPct;
    private Boolean active;
    private OffsetDateTime createdAt;
}
