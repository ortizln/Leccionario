package com.leccionario.backend.schedule.dto;

import com.leccionario.backend.academic.dto.AcademicCourseResponse;
import com.leccionario.backend.academic.dto.AcademicPeriodResponse;
import com.leccionario.backend.academic.dto.AcademicSubjectResponse;
import java.util.List;

public record ScheduleOverviewResponse(
        List<ScheduleBlockResponse> blocks,
        List<CourseScheduleResponse> schedules,
        List<AcademicCourseResponse> courses,
        List<AcademicPeriodResponse> periods,
        List<AcademicSubjectResponse> subjects,
        List<ScheduleTeacherOptionResponse> teachers) {
}
