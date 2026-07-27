package com.leccionario.backend.tutoring.domain;

import com.leccionario.backend.common.domain.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "tutoring_follow_ups")
public class TutoringFollowUp extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "session_id", nullable = false)
    private TutoringSession session;

    @Column(name = "follow_up_date", nullable = false)
    private LocalDate followUpDate;

    @Column(nullable = false, columnDefinition = "text")
    private String notes;

    @Column(nullable = false, length = 20)
    private String status = "PENDIENTE";

    @Column(name = "completed_at")
    private OffsetDateTime completedAt;
}
