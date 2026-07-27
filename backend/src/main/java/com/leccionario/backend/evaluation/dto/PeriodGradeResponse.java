package com.leccionario.backend.evaluation.dto;

import java.math.BigDecimal;
import lombok.Data;

@Data
public class PeriodGradeResponse {
    private Long id;
    private Long studentId;
    private String studentName;
    private Long courseId;
    private String courseName;
    private Long subjectId;
    private String subjectName;
    private Long academicPeriodId;
    private String academicPeriodName;
    private BigDecimal averageScore;
    private String status;
    private String teacherNotes;
}
