package com.leccionario.backend.rrhh;

import com.leccionario.backend.common.domain.BaseEntity;
import jakarta.persistence.*;
import java.math.BigDecimal;
import lombok.*;

@Entity
@Table(name = "employee_benefits")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmployeeBenefit extends BaseEntity {
    @Column(nullable = false)
    private Long employeeId;

    @Column(nullable = false, length = 100)
    private String benefitType;

    @Column(nullable = false, length = 200)
    private String description;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal value;

    @Column(length = 20)
    private String frequency = "MONTHLY";

    private Boolean isActive = true;

    @Column(nullable = false)
    private Long institutionId;
}
