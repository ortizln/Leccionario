package com.leccionario.backend.self.dto;

import java.util.List;

public record TeacherCourseResponse(
    Long courseId,
    String courseName,
    String parallel,
    String level,
    String section,
    String subLevel,
    Integer grade,
    List<String> subjectNames,
    int scheduleCount,
    Long academicYearId,
    Integer academicYear,
    Long schoolDayId,
    String schoolDayName,
    Long schoolModalityId,
    String schoolModalityName,
    Integer capacity
) {}
