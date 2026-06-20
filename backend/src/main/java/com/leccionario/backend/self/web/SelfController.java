package com.leccionario.backend.self.web;

import com.leccionario.backend.academic.dto.AcademicCourseResponse;
import com.leccionario.backend.academic.dto.AcademicStudentResponse;
import com.leccionario.backend.schedule.dto.CourseScheduleResponse;
import com.leccionario.backend.self.service.SelfService;
import java.security.Principal;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
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
    @PreAuthorize("hasAuthority('TEACHER_SELF_VIEW')")
    public ResponseEntity<List<AcademicStudentResponse>> myStudents(Principal principal) {
        return ResponseEntity.ok(selfService.getMyStudents(principal.getName()));
    }

    @GetMapping("/my-teaching-schedule")
    @PreAuthorize("hasAuthority('TEACHER_SELF_VIEW')")
    public ResponseEntity<List<CourseScheduleResponse>> myTeachingSchedule(Principal principal) {
        return ResponseEntity.ok(selfService.getMyTeachingSchedule(principal.getName()));
    }
}
