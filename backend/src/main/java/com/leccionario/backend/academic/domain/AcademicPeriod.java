package com.leccionario.backend.academic.domain;

import com.leccionario.backend.common.domain.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.time.LocalDate;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "academic_periods")
public class AcademicPeriod extends BaseEntity {

    @Column(name = "institution_id")
    private Long institutionId;

    @Column(nullable = false, length = 120)
    private String name;

    @Column(length = 20)
    private String code;

    @Column(name = "period_type", length = 30)
    private String periodType = "BIMESTRE";

    @Column(nullable = false)
    private LocalDate startDate;

    @Column(nullable = false)
    private LocalDate endDate;

    @Column(nullable = false)
    private boolean active = true;
}
