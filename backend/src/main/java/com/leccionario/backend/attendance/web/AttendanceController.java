package com.leccionario.backend.attendance.web;

import com.leccionario.backend.attendance.service.AttendanceService;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/attendance")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceService attendanceService;

    @GetMapping("/student/{studentId}/period/{periodId}")
    @PreAuthorize("hasAuthority('ASISTENCIA_VIEW')")
    public ResponseEntity<List<Map<String, Object>>> getStudentAttendance(
            @PathVariable Long studentId, @PathVariable Long periodId) {
        return ResponseEntity.ok(attendanceService.getStudentAttendance(studentId, periodId));
    }

    @GetMapping("/course/{courseId}/period/{periodId}")
    @PreAuthorize("hasAuthority('ASISTENCIA_VIEW')")
    public ResponseEntity<List<Map<String, Object>>> getCourseAttendance(
            @PathVariable Long courseId, @PathVariable Long periodId) {
        return ResponseEntity.ok(attendanceService.getCourseAttendance(courseId, periodId));
    }

    @GetMapping("/course/{courseId}/period/{periodId}/stats")
    @PreAuthorize("hasAuthority('ASISTENCIA_VIEW')")
    public ResponseEntity<Map<String, Object>> getCourseStats(
            @PathVariable Long courseId, @PathVariable Long periodId) {
        return ResponseEntity.ok(attendanceService.getCourseAttendanceStats(courseId, periodId));
    }

    @GetMapping("/student/{studentId}/period/{periodId}/stats")
    @PreAuthorize("hasAuthority('ASISTENCIA_VIEW')")
    public ResponseEntity<Map<String, Object>> getStudentStats(
            @PathVariable Long studentId, @PathVariable Long periodId) {
        return ResponseEntity.ok(attendanceService.getStudentAttendanceStats(studentId, periodId));
    }

    @GetMapping("/course/{courseId}/period/{periodId}/by-student")
    @PreAuthorize("hasAuthority('ASISTENCIA_VIEW')")
    public ResponseEntity<List<Map<String, Object>>> getCourseByStudent(
            @PathVariable Long courseId, @PathVariable Long periodId) {
        return ResponseEntity.ok(attendanceService.getCourseAttendanceByStudent(courseId, periodId));
    }
}
