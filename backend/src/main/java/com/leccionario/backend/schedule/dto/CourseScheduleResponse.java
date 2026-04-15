package com.leccionario.backend.schedule.dto;

public record CourseScheduleResponse(
        Long id,
        Long courseId,
        String courseName,
        Long periodId,
        String periodName,
        Long scheduleBlockId,
        String scheduleLabel,
        Long subjectId,
        String subjectName,
        Long teacherId,
        String teacherName,
        short weekday,
        String classroom) {
}
