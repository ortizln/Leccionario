package com.leccionario.backend.rrhh;

import com.leccionario.backend.common.domain.BaseEntity;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalTime;
import lombok.*;

@Entity
@Table(name = "employee_attendances")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmployeeAttendance extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(nullable = false)
    private LocalDate attendanceDate;

    private LocalTime checkInTime;
    private LocalTime checkOutTime;

    @Column(length = 20)
    private String status = "PRESENTE"; // PRESENTE, AUSENTE, TARDANZA, PERMISO, VACACIONES

    private String observations;

    @Column(nullable = false)
    private Long institutionId;
}
