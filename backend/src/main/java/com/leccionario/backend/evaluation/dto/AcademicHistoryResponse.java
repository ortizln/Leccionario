package com.leccionario.backend.evaluation.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import lombok.Data;

@Data
public class AcademicHistoryResponse {
    private Long studentId;
    private String studentName;
    private String enrollmentNumber;
    private List<PeriodSummary> periods;

    @Data
    public static class PeriodSummary {
        private Long periodId;
        private String periodName;
        private LocalDate periodStart;
        private LocalDate periodEnd;
        private List<SubjectGrade> subjects;
        private BigDecimal periodAverage;
        private String periodStatus;

        public PeriodSummary(Long periodId, String periodName, LocalDate periodStart, LocalDate periodEnd) {
            this.periodId = periodId;
            this.periodName = periodName;
            this.periodStart = periodStart;
            this.periodEnd = periodEnd;
            this.subjects = new java.util.ArrayList<>();
        }
    }

    @Data
    public static class SubjectGrade {
        private Long subjectId;
        private String subjectName;
        private String teacherName;
        private BigDecimal averageScore;
        private String status;

        public SubjectGrade(Long subjectId, String subjectName, String teacherName, BigDecimal averageScore, String status) {
            this.subjectId = subjectId;
            this.subjectName = subjectName;
            this.teacherName = teacherName;
            this.averageScore = averageScore;
            this.status = status;
        }
    }
}
