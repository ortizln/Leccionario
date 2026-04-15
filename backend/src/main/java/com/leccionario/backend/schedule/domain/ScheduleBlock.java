package com.leccionario.backend.schedule.domain;

import com.leccionario.backend.common.domain.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import java.time.LocalTime;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "schedule_blocks")
public class ScheduleBlock extends BaseEntity {

    @Column(nullable = false, length = 80)
    private String label;

    @Column(nullable = false)
    private LocalTime startTime;

    @Column(nullable = false)
    private LocalTime endTime;

    @Column(nullable = false)
    private int blockOrder;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ScheduleBlockType blockType;

    @Column(nullable = false)
    private boolean active = true;
}
