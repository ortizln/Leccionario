package com.leccionario.backend.evaluation.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import lombok.Data;

@Data
public class GradeScaleRequest {

    private Long id;

    @NotBlank(message = "El nombre es requerido")
    private String name;

    @NotBlank(message = "El tipo de escala es requerido")
    private String scaleType;

    @NotNull(message = "El valor minimo es requerido")
    private BigDecimal minValue;

    @NotNull(message = "El valor maximo es requerido")
    private BigDecimal maxValue;

    @NotNull(message = "El valor de aprobacion es requerido")
    private BigDecimal passValue;

    private Boolean isDefault = false;
}
