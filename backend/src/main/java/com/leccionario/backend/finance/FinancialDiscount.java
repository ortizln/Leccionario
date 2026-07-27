package com.leccionario.backend.finance;

import com.leccionario.backend.common.domain.BaseEntity;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.*;

@Entity
@Table(name = "financial_discounts")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FinancialDiscount extends BaseEntity {
    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 300)
    private String description;

    @Column(nullable = false, length = 30)
    private String discountType; // PORCENTAJE, MONTO_FIJO, BECA

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal value;

    @Column(length = 30)
    private String status = "ACTIVO"; // ACTIVO, INACTIVO

    private LocalDate validFrom;
    private LocalDate validUntil;

    @Column(nullable = false)
    private Long institutionId;

    private Long studentId; // null = descuento general
}
