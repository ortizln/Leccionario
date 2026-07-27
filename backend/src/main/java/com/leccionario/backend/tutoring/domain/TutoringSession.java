package com.leccionario.backend.tutoring.domain;

import com.leccionario.backend.academic.domain.AcademicPeriod;
import com.leccionario.backend.academic.domain.Course;
import com.leccionario.backend.common.domain.BaseEntity;
import com.leccionario.backend.institution.domain.Institution;
import com.leccionario.backend.user.domain.Student;
import com.leccionario.backend.user.domain.Teacher;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDate;
import java.time.LocalTime;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "tutoring_sessions")
public class TutoringSession extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "institution_id", nullable = false)
    private Institution institution;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "teacher_id", nullable = false)
    private Teacher teacher;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "academic_period_id", nullable = false)
    private AcademicPeriod academicPeriod;

    @Column(name = "session_date", nullable = false)
    private LocalDate sessionDate;

    @Column(name = "session_time")
    private LocalTime sessionTime;

    @Column(name = "duration_minutes")
    private Integer durationMinutes = 30;

    @Column(name = "session_type", nullable = false, length = 30)
    private String sessionType = "ACADEMICA";

    @Column(nullable = false, length = 20)
    private String status = "PROGRAMADA";

    @Column(nullable = false, length = 250)
    private String topic;

    @Column(columnDefinition = "text")
    private String description;

    @Column(columnDefinition = "text")
    private String recommendations;

    @Column(name = "follow_up_required", nullable = false)
    private Boolean followUpRequired = false;

    @Column(name = "follow_up_date")
    private LocalDate followUpDate;

    @Column(name = "follow_up_notes", columnDefinition = "text")
    private String followUpNotes;

    @Column(name = "created_by", length = 100)
    private String createdBy;
}
