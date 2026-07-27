package com.leccionario.backend.rrhh;

import com.leccionario.backend.common.domain.BaseEntity;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.*;

@Entity
@Table(name = "employee_evaluations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmployeeEvaluation extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(nullable = false, length = 50)
    private String evaluationType; // DOCENTE, ADMINISTRATIVO, CONVIVENCIA

    @Column(nullable = false)
    private LocalDate evaluationDate;

    @Column(precision = 3, scale = 1)
    private BigDecimal score;

    @Column(length = 20)
    private String status = "PENDIENTE"; // PENDIENTE, COMPLETADA

    @Column(length = 500)
    private String strengths;

    @Column(length = 500)
    private String improvements;

    @Column(length = 500)
    private String comments;

    @Column(nullable = false)
    private Long institutionId;

    @Column(nullable = false)
    private Long evaluatedByUserId;
}
