package com.leccionario.backend.demerit.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "student_demer_details")
public class StudentDemerDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "student_demer_id", nullable = false)
    private StudentDemer studentDemer;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "falta_id", nullable = false)
    private DemeritFalta falta;

    @Column(nullable = false)
    private short quantity = 1;

    @Column(nullable = false)
    private short score;

    @Column(nullable = false)
    private short subtotal;
}
