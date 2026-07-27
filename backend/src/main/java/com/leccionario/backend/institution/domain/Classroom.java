package com.leccionario.backend.institution.domain;

import com.leccionario.backend.common.domain.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "classrooms")
public class Classroom extends BaseEntity {

    @Column(name = "institution_id", nullable = false)
    private Long institutionId;

    @Column(name = "campus_id")
    private Long campusId;

    @Column(name = "shift_id")
    private Long shiftId;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, length = 20)
    private String code;

    @Column(name = "classroom_type", nullable = false, length = 20)
    private String classroomType = "AULA";

    @Column(nullable = false)
    private Integer capacity = 0;

    @Column(length = 10)
    private String floor;

    @Column(length = 10)
    private String wing;

    @Column(name = "has_projector")
    private Boolean hasProjector = false;

    @Column(name = "has_computers")
    private Boolean hasComputers = false;

    @Column(name = "computer_count")
    private Integer computerCount = 0;

    @Column(name = "has_internet")
    private Boolean hasInternet = false;

    @Column(nullable = false)
    private Boolean active = true;
}
