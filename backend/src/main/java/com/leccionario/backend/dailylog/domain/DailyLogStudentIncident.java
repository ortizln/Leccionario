package com.leccionario.backend.dailylog.domain;

import com.leccionario.backend.common.domain.BaseEntity;
import com.leccionario.backend.demerit.domain.Demerit;
import com.leccionario.backend.user.domain.Student;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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
@Table(
        name = "daily_log_student_incidents",
        uniqueConstraints = @UniqueConstraint(name = "uq_daily_log_incident", columnNames = {"daily_log_entry_id", "student_id"}))
public class DailyLogStudentIncident extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "daily_log_entry_id", nullable = false)
    private DailyLogEntry dailyLogEntry;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "demerit_id")
    private Demerit demerit;

    @Column(nullable = false, length = 80)
    private String category;

    @Column(length = 400)
    private String notes;
}
