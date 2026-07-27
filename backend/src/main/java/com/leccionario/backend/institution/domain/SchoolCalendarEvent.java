package com.leccionario.backend.institution.domain;

import com.leccionario.backend.common.domain.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDate;

@Getter
@Setter
@Entity
@Table(name = "school_calendar_events")
public class SchoolCalendarEvent extends BaseEntity {

    @Column(name = "institution_id", nullable = false)
    private Long institutionId;

    @Column(name = "academic_year_id")
    private Long academicYearId;

    @Column(name = "event_name", nullable = false, length = 200)
    private String eventName;

    @Column(name = "event_type", nullable = false, length = 20)
    private String eventType;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "is_recurrent")
    private Boolean isRecurrent = false;

    @Column(name = "recurrence_rule", length = 100)
    private String recurrenceRule;

    @Column(length = 7)
    private String color;

    @Column(nullable = false)
    private Boolean active = true;
}
