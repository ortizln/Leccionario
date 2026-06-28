package com.leccionario.backend.demerit.domain;

import com.leccionario.backend.academic.domain.AcademicPeriod;
import com.leccionario.backend.academic.domain.Course;
import com.leccionario.backend.common.domain.BaseEntity;
import com.leccionario.backend.user.domain.Student;
import com.leccionario.backend.user.domain.Teacher;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "student_demers")
public class StudentDemer extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "period_id", nullable = false)
    private AcademicPeriod period;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id")
    private Course course;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "teacher_id")
    private Teacher teacher;

    @Column(name = "log_date", nullable = false)
    private LocalDate logDate;

    @Column(length = 1000)
    private String observation;

    @Column(name = "total_score", nullable = false)
    private short totalScore = 0;

    @Column(nullable = false, length = 30)
    @Enumerated(EnumType.STRING)
    private DemerStatus status = DemerStatus.CREADO;

    @Column(name = "created_by", length = 100)
    private String createdBy;

    @Column(name = "updated_by", length = 100)
    private String updatedBy;

    @OneToMany(mappedBy = "studentDemer", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<StudentDemerDetail> details = new ArrayList<>();

    @OneToMany(mappedBy = "studentDemer", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DemeritEvidence> evidences = new ArrayList<>();

    @OneToMany(mappedBy = "studentDemer", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DemeritStatusHistory> statusHistory = new ArrayList<>();

    public enum DemerStatus {
        CREADO, VALIDADO, APELADO, ANULADO, APROBADO
    }
}
