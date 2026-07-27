package com.leccionario.backend.evaluation.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import lombok.Data;

@Data
public class EvaluationTypeRequest {

    private Long id;

    @NotBlank(message = "El nombre es requerido")
    private String name;

    @NotBlank(message = "El codigo es requerido")
    private String code;

    private String description;

    @NotNull(message = "El peso es requerido")
    private BigDecimal weightPct;
}
