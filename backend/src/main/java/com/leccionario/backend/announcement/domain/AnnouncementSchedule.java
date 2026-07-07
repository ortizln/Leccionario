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
import java.time.DayOfWeek;
import java.time.LocalDate;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(
    name = "announcement_schedules",
    uniqueConstraints = @UniqueConstraint(columnNames = {"announcement_id", "schedule_date", "schedule_block_id"})
)
public class AnnouncementSchedule extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "announcement_id", nullable = false)
    private Announcement announcement;

    @Column(name = "schedule_date", nullable = false)
    private LocalDate scheduleDate;

    @Column(nullable = false)
    private short weekday;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "schedule_block_id", nullable = false)
    private ScheduleBlock scheduleBlock;

    public void setScheduleDate(LocalDate date) {
        this.scheduleDate = date;
        if (date != null) {
            DayOfWeek dow = date.getDayOfWeek();
            this.weekday = (short) dow.getValue();
        }
    }
}
