package com.leccionario.backend.tutoring.web;

import com.leccionario.backend.tutoring.dto.TutoringFollowUpResponse;
import com.leccionario.backend.tutoring.dto.TutoringSessionRequest;
import com.leccionario.backend.tutoring.dto.TutoringSessionResponse;
import com.leccionario.backend.tutoring.service.TutoringService;
import jakarta.validation.Valid;
import java.security.Principal;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/tutoring")
@RequiredArgsConstructor
public class TutoringController {

    private final TutoringService tutoringService;

    @PostMapping("/sessions")
    @PreAuthorize("hasAuthority('TUTORIA_MANAGE')")
    public ResponseEntity<TutoringSessionResponse> createSession(
            @Valid @RequestBody TutoringSessionRequest request,
            Principal principal) {
        return ResponseEntity.ok(tutoringService.createSession(request, principal.getName()));
    }

    @GetMapping("/sessions/{id}")
    @PreAuthorize("hasAuthority('TUTORIA_VIEW')")
    public ResponseEntity<TutoringSessionResponse> getSession(@PathVariable Long id) {
        return ResponseEntity.ok(tutoringService.getSession(id));
    }

    @GetMapping("/sessions/student/{studentId}/period/{periodId}")
    @PreAuthorize("hasAuthority('TUTORIA_VIEW')")
    public ResponseEntity<List<TutoringSessionResponse>> getStudentSessions(
            @PathVariable Long studentId, @PathVariable Long periodId) {
        return ResponseEntity.ok(tutoringService.getSessionsByStudent(studentId, periodId));
    }

    @GetMapping("/sessions/course/{courseId}/period/{periodId}")
    @PreAuthorize("hasAuthority('TUTORIA_VIEW')")
    public ResponseEntity<List<TutoringSessionResponse>> getCourseSessions(
            @PathVariable Long courseId, @PathVariable Long periodId) {
        return ResponseEntity.ok(tutoringService.getSessionsByCourse(courseId, periodId));
    }

    @GetMapping("/sessions/teacher/{teacherId}/period/{periodId}")
    @PreAuthorize("hasAuthority('TUTORIA_VIEW')")
    public ResponseEntity<List<TutoringSessionResponse>> getTeacherSessions(
            @PathVariable Long teacherId, @PathVariable Long periodId) {
        return ResponseEntity.ok(tutoringService.getSessionsByTeacher(teacherId, periodId));
    }

    @PutMapping("/sessions/{id}/status")
    @PreAuthorize("hasAuthority('TUTORIA_MANAGE')")
    public ResponseEntity<TutoringSessionResponse> updateStatus(
            @PathVariable Long id, @RequestParam String status) {
        return ResponseEntity.ok(tutoringService.updateStatus(id, status));
    }

    @PostMapping("/sessions/{sessionId}/follow-ups")
    @PreAuthorize("hasAuthority('TUTORIA_MANAGE')")
    public ResponseEntity<TutoringFollowUpResponse> addFollowUp(
            @PathVariable Long sessionId,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(tutoringService.addFollowUp(sessionId, body.get("notes"), body.get("followUpDate")));
    }

    @PutMapping("/follow-ups/{id}/complete")
    @PreAuthorize("hasAuthority('TUTORIA_MANAGE')")
    public ResponseEntity<TutoringFollowUpResponse> completeFollowUp(@PathVariable Long id) {
        return ResponseEntity.ok(tutoringService.completeFollowUp(id));
    }

    @GetMapping("/stats/course/{courseId}/period/{periodId}")
    @PreAuthorize("hasAuthority('TUTORIA_VIEW')")
    public ResponseEntity<Map<String, Object>> getCourseStats(
            @PathVariable Long courseId, @PathVariable Long periodId) {
        return ResponseEntity.ok(tutoringService.getStats(courseId, periodId));
    }

    @GetMapping("/stats/student/{studentId}/period/{periodId}")
    @PreAuthorize("hasAuthority('TUTORIA_VIEW')")
    public ResponseEntity<Map<String, Object>> getStudentStats(
            @PathVariable Long studentId, @PathVariable Long periodId) {
        return ResponseEntity.ok(tutoringService.getStudentStats(studentId, periodId));
    }
}
