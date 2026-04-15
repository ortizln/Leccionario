package com.leccionario.backend.dailylog.domain;

import com.leccionario.backend.academic.domain.Subject;
import com.leccionario.backend.common.domain.BaseEntity;
import com.leccionario.backend.schedule.domain.ScheduleBlock;
import com.leccionario.backend.user.domain.Teacher;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "daily_log_entries")
public class DailyLogEntry extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "daily_log_id", nullable = false)
    private DailyLog dailyLog;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "schedule_block_id", nullable = false)
    private ScheduleBlock scheduleBlock;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "teacher_id")
    private Teacher teacher;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subject_id")
    private Subject subject;

    @Column(length = 250)
    private String didacticUnit;

    @Column(length = 300)
    private String curricularSkill;

    @Column(length = 300)
    private String topic;

    @Column(nullable = false, unique = true, length = 80)
    private String closeToken;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TeacherSignatureStatus teacherSignatureStatus = TeacherSignatureStatus.PENDING;

    private LocalDateTime teacherClosedAt;

    @Column(columnDefinition = "TEXT")
    private String specificNotes;

    @Column(columnDefinition = "TEXT")
    private String generalNotes;

    @OneToMany(mappedBy = "dailyLogEntry", orphanRemoval = true)
    private List<DailyLogStudentAbsence> absences = new ArrayList<>();

    @OneToMany(mappedBy = "dailyLogEntry", orphanRemoval = true)
    private List<DailyLogStudentIncident> incidents = new ArrayList<>();
}
