package com.leccionario.backend.conduct.dto;

import java.time.LocalDate;
import lombok.Data;

@Data
public class StudentMeritResponse {
    private Long id;
    private Long studentId;
    private String studentName;
    private String enrollmentNumber;
    private Long courseId;
    private String courseName;
    private Long academicPeriodId;
    private String academicPeriodName;
    private Long categoryId;
    private String categoryName;
    private LocalDate meritDate;
    private Integer points;
    private String description;
    private String registeredBy;
}
