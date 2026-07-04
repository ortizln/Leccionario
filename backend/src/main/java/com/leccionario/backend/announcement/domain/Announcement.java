package com.leccionario.backend.announcement.domain;

import com.leccionario.backend.academic.domain.Course;
import com.leccionario.backend.common.domain.BaseEntity;
import com.leccionario.backend.user.domain.User;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "announcements")
public class Announcement extends BaseEntity {

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "announcement_type", nullable = false, length = 20)
    private AnnouncementType announcementType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private AnnouncementPriority priority = AnnouncementPriority.NORMAL;

    @Column(name = "event_date")
    private LocalDate eventDate;

    @Column(name = "event_end_date")
    private LocalDate eventEndDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id")
    private Course course;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    @OneToMany(mappedBy = "announcement", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AnnouncementSchedule> schedules = new ArrayList<>();
}
