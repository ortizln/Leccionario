package com.leccionario.backend.tutoring.dto;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import lombok.Data;

@Data
public class TutoringSessionResponse {
    private Long id;
    private Long teacherId;
    private String teacherName;
    private Long studentId;
    private String studentName;
    private String enrollmentNumber;
    private Long courseId;
    private String courseName;
    private Long academicPeriodId;
    private String academicPeriodName;
    private LocalDate sessionDate;
    private LocalTime sessionTime;
    private Integer durationMinutes;
    private String sessionType;
    private String status;
    private String topic;
    private String description;
    private String recommendations;
    private Boolean followUpRequired;
    private LocalDate followUpDate;
    private String followUpNotes;
    private String createdBy;
    private List<TutoringFollowUpResponse> followUps;
}
