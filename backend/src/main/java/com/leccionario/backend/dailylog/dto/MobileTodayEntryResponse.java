package com.leccionario.backend.dailylog.dto;

import com.leccionario.backend.demerit.dto.DemeritOptionResponse;
import java.util.List;

public record MobileTodayEntryResponse(
        Long id,
        Long dailyLogId,
        String logCloseToken,
        String entryCloseToken,
        Long courseId,
        String courseName,
        String logDate,
        String periodName,
        String scheduleLabel,
        String startTime,
        String endTime,
        String subjectName,
        String teacherName,
        String didacticUnit,
        String curricularSkill,
        String topic,
        String specificNotes,
        String generalNotes,
        String teacherSignatureStatus,
        List<DemeritOptionResponse> demerits,
        List<DailyLogStudentOptionResponse> students,
        List<DailyLogAbsenceResponse> absences,
        List<DailyLogIncidentResponse> incidents) {
}
