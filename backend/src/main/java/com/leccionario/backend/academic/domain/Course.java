package com.leccionario.backend.academic.domain;

import com.leccionario.backend.common.domain.BaseEntity;
import com.leccionario.backend.user.domain.Student;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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
@Table(name = "courses", uniqueConstraints = @UniqueConstraint(
        columnNames = {"sub_level", "grade", "parallel", "academic_year_id"},
        name = "uk_course_sublevel_grade_parallel_year"))
public class Course extends BaseEntity {

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, length = 5)
    private String parallel;

    @Column(nullable = false, length = 50)
    private String level;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private CourseSection section;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private CourseSubLevel subLevel;

    private Integer grade;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "week_student_id")
    private Student weekStudent;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "academic_year_id")
    private AcademicYear academicYear;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "school_day_id")
    private SchoolDay schoolDay;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "school_modality_id")
    private SchoolModality schoolModality;

    private Integer capacity;
}
