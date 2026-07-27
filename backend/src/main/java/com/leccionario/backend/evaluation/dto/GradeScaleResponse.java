package com.leccionario.backend.evaluation.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import lombok.Data;

@Data
public class GradeScaleResponse {
    private Long id;
    private Long institutionId;
    private String name;
    private String scaleType;
    private BigDecimal minValue;
    private BigDecimal maxValue;
    private BigDecimal passValue;
    private Boolean isDefault;
    private Boolean active;
    private OffsetDateTime createdAt;
}
