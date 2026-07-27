package com.leccionario.backend.institution.domain;

import com.leccionario.backend.common.domain.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "campus")
public class Campus extends BaseEntity {

    @Column(name = "institution_id", nullable = false)
    private Long institutionId;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(length = 20)
    private String code;

    @Column(length = 300)
    private String address;

    @Column(precision = 10, scale = 7)
    private java.math.BigDecimal latitude;

    @Column(precision = 10, scale = 7)
    private java.math.BigDecimal longitude;

    @Column(length = 20)
    private String phone;

    @Column(length = 150)
    private String email;

    @Column(name = "campus_type", nullable = false, length = 20)
    private String campusType = "PRINCIPAL";

    @Column(nullable = false)
    private Boolean active = true;
}
