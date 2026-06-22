package com.leccionario.backend.schedule.web;

import com.leccionario.backend.schedule.dto.CourseScheduleRequest;
import com.leccionario.backend.schedule.dto.CourseScheduleResponse;
import com.leccionario.backend.schedule.dto.ScheduleBlockRequest;
import com.leccionario.backend.schedule.dto.ScheduleBlockResponse;
import com.leccionario.backend.schedule.dto.ScheduleOverviewResponse;
import com.leccionario.backend.common.excel.ImportSummaryResponse;
import com.leccionario.backend.schedule.service.ScheduleService;
import jakarta.validation.Valid;
import java.security.Principal;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/schedules")
@RequiredArgsConstructor
public class ScheduleController {

    private final ScheduleService scheduleService;

    @GetMapping("/overview")
    @PreAuthorize("hasAnyAuthority('ACADEMIC_VIEW', 'LESSONPLAN_VIEW')")
    public ResponseEntity<ScheduleOverviewResponse> overview() {
        return ResponseEntity.ok(scheduleService.getOverview());
    }

    @GetMapping("/by-course/{courseId}")
    @PreAuthorize("hasAnyAuthority('ACADEMIC_VIEW', 'TEACHER_SELF_VIEW', 'STUDENT_SELF_VIEW')")
    public ResponseEntity<List<CourseScheduleResponse>> getCourseSchedules(@PathVariable Long courseId) {
        return ResponseEntity.ok(scheduleService.getCourseSchedules(courseId));
    }

    @GetMapping("/import-template/blocks")
    @PreAuthorize("hasAuthority('ACADEMIC_VIEW')")
    public ResponseEntity<ByteArrayResource> downloadBlockTemplate() {
        byte[] file = scheduleService.exportBlockTemplate();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=bloques-plantilla.xlsx")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(new ByteArrayResource(file));
    }

    @GetMapping("/import-template/assignments")
    @PreAuthorize("hasAuthority('ACADEMIC_VIEW')")
    public ResponseEntity<ByteArrayResource> downloadAssignmentsTemplate() {
        byte[] file = scheduleService.exportAssignmentTemplate();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=horarios-plantilla.xlsx")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(new ByteArrayResource(file));
    }

    @PostMapping("/blocks")
    @PreAuthorize("hasAuthority('ACADEMIC_MANAGE')")
    public ResponseEntity<ScheduleBlockResponse> createBlock(
            @Valid @RequestBody ScheduleBlockRequest request,
            Principal principal) {
        return ResponseEntity.ok(scheduleService.createBlock(request, principal.getName()));
    }

    @PutMapping("/blocks/{id}")
    @PreAuthorize("hasAuthority('ACADEMIC_MANAGE')")
    public ResponseEntity<ScheduleBlockResponse> updateBlock(
            @PathVariable Long id,
            @Valid @RequestBody ScheduleBlockRequest request,
            Principal principal) {
        return ResponseEntity.ok(scheduleService.updateBlock(id, request, principal.getName()));
    }

    @PostMapping("/course-assignments")
    @PreAuthorize("hasAuthority('ACADEMIC_MANAGE')")
    public ResponseEntity<CourseScheduleResponse> createSchedule(
            @Valid @RequestBody CourseScheduleRequest request,
            Principal principal) {
        return ResponseEntity.ok(scheduleService.createSchedule(request, principal.getName()));
    }

    @PutMapping("/course-assignments/{id}")
    @PreAuthorize("hasAuthority('ACADEMIC_MANAGE')")
    public ResponseEntity<CourseScheduleResponse> updateSchedule(
            @PathVariable Long id,
            @Valid @RequestBody CourseScheduleRequest request,
            Principal principal) {
        return ResponseEntity.ok(scheduleService.updateSchedule(id, request, principal.getName()));
    }

    @DeleteMapping("/course-assignments/{id}")
    @PreAuthorize("hasAuthority('ACADEMIC_MANAGE')")
    public ResponseEntity<Void> deleteSchedule(@PathVariable Long id, Principal principal) {
        scheduleService.deleteSchedule(id, principal.getName());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/import/blocks")
    @PreAuthorize("hasAuthority('ACADEMIC_MANAGE')")
    public ResponseEntity<ImportSummaryResponse> importBlocks(
            @RequestParam("file") MultipartFile file,
            Principal principal) {
        return ResponseEntity.ok(scheduleService.importBlocks(file, principal.getName()));
    }

    @PostMapping("/import/assignments")
    @PreAuthorize("hasAuthority('ACADEMIC_MANAGE')")
    public ResponseEntity<ImportSummaryResponse> importAssignments(
            @RequestParam("file") MultipartFile file,
            Principal principal) {
        return ResponseEntity.ok(scheduleService.importAssignments(file, principal.getName()));
    }
}
