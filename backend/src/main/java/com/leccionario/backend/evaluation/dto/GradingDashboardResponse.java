package com.leccionario.backend.evaluation.dto;

import java.math.BigDecimal;
import java.util.List;
import lombok.Data;

@Data
public class GradingDashboardResponse {
    private Long periodId;
    private String periodName;

    private long totalStudents;
    private long totalEvaluations;
    private long totalGrades;
    private BigDecimal overallAverage;
    private long approvedCount;
    private long failedCount;
    private long pendingCount;
    private BigDecimal approvalRate;

    private List<CourseStats> courseStats;
    private List<StudentRanking> topStudents;
    private List<StudentRanking> bottomStudents;
    private List<DistributionBucket> distribution;

    @Data
    public static class CourseStats {
        private Long courseId;
        private String courseName;
        private long studentCount;
        private BigDecimal average;
        private long approved;
        private long failed;

        public CourseStats(Long courseId, String courseName, long studentCount, BigDecimal average, long approved, long failed) {
            this.courseId = courseId;
            this.courseName = courseName;
            this.studentCount = studentCount;
            this.average = average;
            this.approved = approved;
            this.failed = failed;
        }
    }

    @Data
    public static class StudentRanking {
        private Long studentId;
        private String studentName;
        private String courseName;
        private BigDecimal average;
        private long approvedSubjects;
        private long totalSubjects;

        public StudentRanking(Long studentId, String studentName, String courseName, BigDecimal average, long approvedSubjects, long totalSubjects) {
            this.studentId = studentId;
            this.studentName = studentName;
            this.courseName = courseName;
            this.average = average;
            this.approvedSubjects = approvedSubjects;
            this.totalSubjects = totalSubjects;
        }
    }

    @Data
    public static class DistributionBucket {
        private String range;
        private long count;

        public DistributionBucket(String range, long count) {
            this.range = range;
            this.count = count;
        }
    }
}
