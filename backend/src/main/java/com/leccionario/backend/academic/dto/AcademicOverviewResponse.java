package com.leccionario.backend.academic.dto;

import java.util.List;

public record AcademicOverviewResponse(
        List<AcademicCourseResponse> courses,
        List<AcademicSubjectResponse> subjects,
        List<AcademicPeriodResponse> periods,
        List<AcademicStudentResponse> students,
        List<AcademicTeacherResponse> teachers) {
}
