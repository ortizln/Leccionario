package com.leccionario.backend.self.web;

import com.leccionario.backend.academic.dto.AcademicCourseResponse;
import com.leccionario.backend.academic.dto.AcademicStudentResponse;
import com.leccionario.backend.dailylog.dto.DailyLogResponse;
import com.leccionario.backend.schedule.dto.CourseScheduleResponse;
import com.leccionario.backend.self.dto.TeacherCourseResponse;
import com.leccionario.backend.self.dto.WeeklyJournalResponse;
import com.leccionario.backend.self.service.SelfService;
import java.security.Principal;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/self")
@RequiredArgsConstructor
public class SelfController {

    private final SelfService selfService;

    @GetMapping("/course")
    @PreAuthorize("hasAuthority('STUDENT_SELF_VIEW')")
    public ResponseEntity<AcademicCourseResponse> myCourse(Principal principal) {
        return ResponseEntity.ok(selfService.getMyCourse(principal.getName()));
    }

    @GetMapping("/classmates")
    @PreAuthorize("hasAuthority('STUDENT_SELF_VIEW')")
    public ResponseEntity<List<AcademicStudentResponse>> myClassmates(Principal principal) {
        return ResponseEntity.ok(selfService.getMyClassmates(principal.getName()));
    }

    @GetMapping("/schedule")
    @PreAuthorize("hasAuthority('STUDENT_SELF_VIEW')")
    public ResponseEntity<List<CourseScheduleResponse>> mySchedule(Principal principal) {
        return ResponseEntity.ok(selfService.getMySchedule(principal.getName()));
    }

    @GetMapping("/my-students")
    @PreAuthorize("hasAnyAuthority('TEACHER_SELF_VIEW', 'ACADEMIC_MANAGE')")
    public ResponseEntity<List<AcademicStudentResponse>> myStudents(Principal principal) {
        return ResponseEntity.ok(selfService.getMyStudents(principal.getName()));
    }

    @GetMapping("/my-courses")
    @PreAuthorize("hasAnyAuthority('TEACHER_SELF_VIEW', 'ACADEMIC_MANAGE')")
    public ResponseEntity<List<TeacherCourseResponse>> myCourses(Principal principal) {
        return ResponseEntity.ok(selfService.getMyCourses(principal.getName()));
    }

    @GetMapping("/my-courses/{courseId}/students")
    @PreAuthorize("hasAnyAuthority('TEACHER_SELF_VIEW', 'ACADEMIC_MANAGE')")
    public ResponseEntity<List<AcademicStudentResponse>> myCourseStudents(
            @PathVariable Long courseId, Principal principal) {
        return ResponseEntity.ok(selfService.getMyCourseStudents(principal.getName(), courseId));
    }

    @GetMapping("/my-teaching-schedule")
    @PreAuthorize("hasAnyAuthority('TEACHER_SELF_VIEW', 'ACADEMIC_MANAGE')")
    public ResponseEntity<List<CourseScheduleResponse>> myTeachingSchedule(Principal principal) {
        return ResponseEntity.ok(selfService.getMyTeachingSchedule(principal.getName()));
    }

    @GetMapping("/my-weekly-journal")
    @PreAuthorize("hasAnyAuthority('TEACHER_SELF_VIEW', 'ACADEMIC_MANAGE')")
    public ResponseEntity<WeeklyJournalResponse> myWeeklyJournal(
            @RequestParam(defaultValue = "0") int weekOffset, Principal principal) {
        return ResponseEntity.ok(selfService.getMyWeeklyJournal(principal.getName(), weekOffset));
    }

    @GetMapping("/my-course-daily-log")
    @PreAuthorize("hasAnyAuthority('STUDENT_SELF_VIEW', 'ACADEMIC_MANAGE')")
    public ResponseEntity<DailyLogResponse> myCourseDailyLog(
            @RequestParam(required = false) String logDate, Principal principal) {
        return ResponseEntity.ok(selfService.getMyCourseDailyLog(principal.getName(), logDate));
    }
}
