package com.leccionario.backend.evaluation.domain;

import com.leccionario.backend.common.domain.BaseEntity;
import com.leccionario.backend.institution.domain.Institution;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "grade_scales")
public class GradeScale extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "institution_id", nullable = false)
    private Institution institution;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(name = "scale_type", nullable = false, length = 20)
    private String scaleType;

    @Column(name = "min_value", nullable = false, precision = 5, scale = 2)
    private java.math.BigDecimal minValue;

    @Column(name = "max_value", nullable = false, precision = 5, scale = 2)
    private java.math.BigDecimal maxValue;

    @Column(name = "pass_value", nullable = false, precision = 5, scale = 2)
    private java.math.BigDecimal passValue;

    @Column(name = "is_default", nullable = false)
    private Boolean isDefault = false;

    @Column(nullable = false)
    private Boolean active = true;
}
