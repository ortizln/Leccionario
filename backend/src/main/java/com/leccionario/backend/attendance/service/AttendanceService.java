package com.leccionario.backend.attendance.service;

import com.leccionario.backend.dailylog.domain.DailyLogStudentAbsence;
import com.leccionario.backend.dailylog.repository.DailyLogStudentAbsenceRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AttendanceService {

    private final DailyLogStudentAbsenceRepository absenceRepository;

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getStudentAttendance(Long studentId, Long periodId) {
        List<DailyLogStudentAbsence> absences = absenceRepository.findByStudentAndPeriod(studentId, periodId);
        return absences.stream().map(a -> {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("id", a.getId());
            item.put("date", a.getDailyLogEntry().getDailyLog().getLogDate());
            item.put("courseName", a.getDailyLogEntry().getDailyLog().getCourse().getName());
            item.put("subjectName", a.getDailyLogEntry().getSubject() != null ? a.getDailyLogEntry().getSubject().getName() : null);
            item.put("blockLabel", a.getDailyLogEntry().getScheduleBlock().getLabel());
            item.put("absenceType", a.getAbsenceType().name());
            item.put("notes", a.getNotes());
            return item;
        }).toList();
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getCourseAttendance(Long courseId, Long periodId) {
        List<DailyLogStudentAbsence> absences = absenceRepository.findByCourseAndPeriod(courseId, periodId);
        return absences.stream().map(a -> {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("id", a.getId());
            item.put("studentId", a.getStudent().getId());
            item.put("studentName", a.getStudent().getUser().getFirstName() + " " + a.getStudent().getUser().getLastName());
            item.put("enrollmentNumber", a.getStudent().getEnrollmentNumber());
            item.put("date", a.getDailyLogEntry().getDailyLog().getLogDate());
            item.put("subjectName", a.getDailyLogEntry().getSubject() != null ? a.getDailyLogEntry().getSubject().getName() : null);
            item.put("blockLabel", a.getDailyLogEntry().getScheduleBlock().getLabel());
            item.put("absenceType", a.getAbsenceType().name());
            item.put("notes", a.getNotes());
            return item;
        }).toList();
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getCourseAttendanceStats(Long courseId, Long periodId) {
        Map<String, Object> stats = new LinkedHashMap<>();
        long totalAbsences = absenceRepository.countByCourseAndPeriod(courseId, periodId);
        List<Object[]> byType = absenceRepository.countByTypeForCourseAndPeriod(courseId, periodId);

        stats.put("totalAbsences", totalAbsences);
        Map<String, Long> typeMap = new LinkedHashMap<>();
        typeMap.put("ABSENT", 0L);
        typeMap.put("LATE", 0L);
        typeMap.put("JUSTIFIED", 0L);
        for (Object[] row : byType) {
            typeMap.put((String) row[0], (Long) row[1]);
        }
        stats.put("byType", typeMap);

        long totalStudents = 0;
        try {
            var absences = absenceRepository.findByCourseAndPeriod(courseId, periodId);
            totalStudents = absences.stream()
                    .map(a -> a.getStudent().getId())
                    .distinct()
                    .count();
        } catch (Exception e) {
            // ignore
        }
        stats.put("studentsWithAbsences", totalStudents);
        return stats;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getStudentAttendanceStats(Long studentId, Long periodId) {
        Map<String, Object> stats = new LinkedHashMap<>();
        long totalAbsences = absenceRepository.countByStudentAndPeriod(studentId, periodId);
        List<Object[]> byType = absenceRepository.countByTypeForStudentAndPeriod(studentId, periodId);

        stats.put("totalAbsences", totalAbsences);
        Map<String, Long> typeMap = new LinkedHashMap<>();
        typeMap.put("ABSENT", 0L);
        typeMap.put("LATE", 0L);
        typeMap.put("JUSTIFIED", 0L);
        for (Object[] row : byType) {
            typeMap.put((String) row[0], (Long) row[1]);
        }
        stats.put("byType", typeMap);

        long unjustified = typeMap.getOrDefault("ABSENT", 0L) + typeMap.getOrDefault("LATE", 0L);
        stats.put("unjustifiedAbsences", unjustified);
        return stats;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getCourseAttendanceByStudent(Long courseId, Long periodId) {
        List<DailyLogStudentAbsence> absences = absenceRepository.findByCourseAndPeriod(courseId, periodId);
        Map<Long, Map<String, Object>> studentMap = new LinkedHashMap<>();

        for (DailyLogStudentAbsence a : absences) {
            Long studentId = a.getStudent().getId();
            studentMap.computeIfAbsent(studentId, k -> {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("studentId", studentId);
                m.put("studentName", a.getStudent().getUser().getFirstName() + " " + a.getStudent().getUser().getLastName());
                m.put("enrollmentNumber", a.getStudent().getEnrollmentNumber());
                m.put("absent", 0L);
                m.put("late", 0L);
                m.put("justified", 0L);
                m.put("total", 0L);
                return m;
            });
            Map<String, Object> m = studentMap.get(studentId);
            m.put("total", (Long) m.get("total") + 1);
            switch (a.getAbsenceType()) {
                case ABSENT -> m.put("absent", (Long) m.get("absent") + 1);
                case LATE -> m.put("late", (Long) m.get("late") + 1);
                case JUSTIFIED -> m.put("justified", (Long) m.get("justified") + 1);
            }
        }

        return new ArrayList<>(studentMap.values());
    }
}
