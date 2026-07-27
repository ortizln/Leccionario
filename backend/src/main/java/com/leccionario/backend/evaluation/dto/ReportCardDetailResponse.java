package com.leccionario.backend.evaluation.dto;

import java.math.BigDecimal;
import lombok.Data;

@Data
public class ReportCardDetailResponse {
    private Long id;
    private Long subjectId;
    private String subjectName;
    private Long teacherId;
    private String teacherName;
    private BigDecimal averageScore;
    private String status;
    private String teacherComment;
    private Integer evaluationCount;
}
