package com.leccionario.backend.announcement.domain;

import com.leccionario.backend.common.domain.BaseEntity;
import com.leccionario.backend.schedule.domain.ScheduleBlock;
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
    name = "announcement_schedules",
    uniqueConstraints = @UniqueConstraint(columnNames = {"announcement_id", "weekday", "schedule_block_id"})
)
public class AnnouncementSchedule extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "announcement_id", nullable = false)
    private Announcement announcement;

    @Column(nullable = false)
    private short weekday;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "schedule_block_id", nullable = false)
    private ScheduleBlock scheduleBlock;
}
