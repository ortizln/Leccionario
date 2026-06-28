package com.leccionario.backend.demerit.domain;

import com.leccionario.backend.common.domain.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "demerit_categories")
public class DemeritCategory extends BaseEntity {

    @Column(length = 20, unique = true, nullable = false)
    private String code;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(length = 500)
    private String description;

    @Column(name = "display_order", nullable = false)
    private short displayOrder = 0;

    @Column(nullable = false)
    private boolean active = true;
}
