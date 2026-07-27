package com.leccionario.backend.rrhh;

import com.leccionario.backend.common.domain.BaseEntity;
import jakarta.persistence.*;
import java.time.LocalDate;
import lombok.*;

@Entity
@Table(name = "employee_actions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmployeeAction extends BaseEntity {
    @Column(nullable = false)
    private Long employeeId;

    @Column(nullable = false, length = 50)
    private String actionType;

    @Column(nullable = false, length = 500)
    private String description;

    private LocalDate actionDate = LocalDate.now();

    @Column(length = 500)
    private String observations;

    @Column(length = 50)
    private String severity = "LEVE";

    @Column(nullable = false)
    private Long institutionId;
}
