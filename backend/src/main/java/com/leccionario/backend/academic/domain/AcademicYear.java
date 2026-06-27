package com.leccionario.backend.academic.domain;

import com.leccionario.backend.common.domain.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "academic_years", uniqueConstraints = @UniqueConstraint(columnNames = {"year"}))
public class AcademicYear extends BaseEntity {

    @Column(nullable = false)
    private int year;

    @Column(nullable = false)
    private boolean active = true;
}
