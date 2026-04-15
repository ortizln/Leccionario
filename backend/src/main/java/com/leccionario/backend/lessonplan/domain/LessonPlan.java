package com.leccionario.backend.lessonplan.domain;

import com.leccionario.backend.academic.domain.AcademicPeriod;
import com.leccionario.backend.academic.domain.Course;
import com.leccionario.backend.academic.domain.Subject;
import com.leccionario.backend.common.domain.BaseEntity;
import com.leccionario.backend.user.domain.Teacher;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDate;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "lesson_plans")
public class LessonPlan extends BaseEntity {

    @Column(nullable = false)
    private LocalDate lessonDate;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "teacher_id", nullable = false)
    private Teacher teacher;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "subject_id", nullable = false)
    private Subject subject;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "period_id", nullable = false)
    private AcademicPeriod period;

    @Column(nullable = false, length = 250)
    private String topic;

    @Column(nullable = false, length = 500)
    private String objective;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String activities;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String resources;

    @Column(length = 1000)
    private String observations;

    @Column(nullable = false, length = 250)
    private String curricularSkill;

    @Column(nullable = false)
    private boolean curriculumCompleted;
}
