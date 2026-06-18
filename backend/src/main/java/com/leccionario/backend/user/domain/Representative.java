package com.leccionario.backend.user.domain;

import com.leccionario.backend.common.domain.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "representatives")
public class Representative extends BaseEntity {

    @Column
    private Long studentId;

    @Column(nullable = false, length = 200)
    private String fullName;

    @Column(nullable = false, length = 50)
    private String relationship;

    @Column(nullable = false, length = 20)
    private String phone;

    @Column(length = 120)
    private String email;

    @Column(length = 200)
    private String emergencyContact;

    @Column(length = 20)
    private String emergencyPhone;

    @Column(length = 300)
    private String address;
}
