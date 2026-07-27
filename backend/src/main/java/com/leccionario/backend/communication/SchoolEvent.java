package com.leccionario.backend.communication;

import com.leccionario.backend.common.domain.BaseEntity;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.*;

@Entity
@Table(name = "school_events")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SchoolEvent extends BaseEntity {
    @Column(nullable = false, length = 200)
    private String title;

    @Column(length = 1000)
    private String description;

    @Column(nullable = false)
    private LocalDateTime eventDate;

    private LocalDateTime endDate;

    @Column(length = 100)
    private String location;

    @Column(length = 30)
    private String eventType; // ACADEMICO, CULTURAL, DEPORTIVO, SOCIALIZACION, REUNION

    @Column(length = 30)
    private String status = "PROGRAMADO"; // PROGRAMADO, EN_CURSO, FINALIZADO, CANCELADO

    @Column(nullable = false)
    private Long institutionId;

    @Column(nullable = false)
    private Long organizerUserId;

    private Boolean isPublic = true;
}
