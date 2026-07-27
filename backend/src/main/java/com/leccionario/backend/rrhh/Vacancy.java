package com.leccionario.backend.rrhh;

import com.leccionario.backend.common.domain.BaseEntity;
import jakarta.persistence.*;
import java.time.LocalDate;
import lombok.*;

@Entity
@Table(name = "vacancies")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Vacancy extends BaseEntity {
    @Column(nullable = false, length = 200)
    private String title;

    @Column(length = 2000)
    private String description;

    @Column(nullable = false, length = 50)
    private String department;

    @Column(length = 50)
    private String positionType = "FULL_TIME";

    @Column(length = 50)
    private String status = "OPEN";

    private Integer positionsAvailable = 1;

    private LocalDate publishedDate = LocalDate.now();

    private LocalDate closingDate;

    @Column(length = 100)
    private String requirements;

    @Column(nullable = false)
    private Long institutionId;
}
