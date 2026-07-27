package com.leccionario.backend.evaluation.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import lombok.Data;

@Data
public class ReportCardResponse {
    private Long id;
    private Long studentId;
    private String studentName;
    private String enrollmentNumber;
    private Long courseId;
    private String courseName;
    private Long academicPeriodId;
    private String academicPeriodName;
    private String status;
    private BigDecimal overallAverage;
    private String finalStatus;
    private String teacherComments;
    private String conductNotes;
    private String attendanceSummary;
    private String observations;
    private String generatedBy;
    private OffsetDateTime generatedAt;
    private OffsetDateTime signedAt;
    private OffsetDateTime deliveredAt;
    private List<ReportCardDetailResponse> details;
}
