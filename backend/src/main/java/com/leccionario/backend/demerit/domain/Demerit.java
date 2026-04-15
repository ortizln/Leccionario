package com.leccionario.backend.demerit.domain;

import com.leccionario.backend.common.domain.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "demerits")
public class Demerit extends BaseEntity {

    @Column(length = 20, unique = true)
    private String code;

    @Column(nullable = false, length = 120)
    private String category;

    @Column(nullable = false, length = 500)
    private String description;

    @Column(nullable = false)
    private short score;

    @Column(nullable = false)
    private boolean active = true;
}
