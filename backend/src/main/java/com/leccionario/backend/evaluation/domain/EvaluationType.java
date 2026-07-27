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
@Table(name = "evaluation_types")
public class EvaluationType extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "institution_id", nullable = false)
    private Institution institution;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, length = 30)
    private String code;

    @Column(length = 300)
    private String description;

    @Column(name = "weight_pct", nullable = false, precision = 5, scale = 2)
    private java.math.BigDecimal weightPct = java.math.BigDecimal.valueOf(100);

    @Column(nullable = false)
    private Boolean active = true;
}
