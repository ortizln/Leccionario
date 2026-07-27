package com.leccionario.backend.evaluation.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import lombok.Data;

@Data
public class GradeGridResponse {
    private Long courseId;
    private String courseName;
    private Long subjectId;
    private String subjectName;
    private Long academicPeriodId;
    private String academicPeriodName;
    private List<EvaluationHeader> evaluations;
    private List<StudentGradeRow> students;

    @Data
    public static class EvaluationHeader {
        private Long id;
        private String name;
        private String type;
        private BigDecimal weight;
        private BigDecimal maxScore;
        private LocalDate date;

        public EvaluationHeader(Long id, String name, String type, BigDecimal weight, BigDecimal maxScore, LocalDate date) {
            this.id = id;
            this.name = name;
            this.type = type;
            this.weight = weight;
            this.maxScore = maxScore;
            this.date = date;
        }
    }

    @Data
    public static class StudentGradeRow {
        private Long studentId;
        private String studentName;
        private String enrollmentNumber;
        private List<BigDecimal> scores;
        private BigDecimal average;
        private String status;
    }
}
