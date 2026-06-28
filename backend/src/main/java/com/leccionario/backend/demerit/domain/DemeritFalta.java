package com.leccionario.backend.demerit.domain;

import com.leccionario.backend.common.domain.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "demerit_faltas",
       uniqueConstraints = @UniqueConstraint(name = "uq_falta_category_code", columnNames = {"category_id", "code"}))
public class DemeritFalta extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "category_id", nullable = false)
    private DemeritCategory category;

    @Column(nullable = false, length = 20)
    private String code;

    @Column(nullable = false, length = 500)
    private String description;

    @Column(nullable = false)
    private short score;

    @Column(nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    private FaltaSeverity severity = FaltaSeverity.MEDIA;

    @Column(name = "requires_observation", nullable = false)
    private boolean requiresObservation = false;

    @Column(name = "requires_evidence", nullable = false)
    private boolean requiresEvidence = false;

    @Column(name = "requires_representative", nullable = false)
    private boolean requiresRepresentative = false;

    @Column(nullable = false)
    private boolean active = true;

    public enum FaltaSeverity {
        LEVE, MEDIA, GRAVE, MUY_GRAVE
    }
}
