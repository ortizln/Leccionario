package com.leccionario.backend.questionbank.domain;

import com.leccionario.backend.common.domain.BaseEntity;
import com.leccionario.backend.institution.domain.Institution;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "question_categories", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"institution_id", "name"})
})
public class QuestionCategory extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "institution_id", nullable = false)
    private Institution institution;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(length = 300)
    private String description;

    @Column(nullable = false)
    private Boolean active = true;
}
