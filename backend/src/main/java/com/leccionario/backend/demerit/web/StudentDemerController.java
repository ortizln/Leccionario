package com.leccionario.backend.demerit.web;

import com.leccionario.backend.demerit.dto.StudentDemerRequest;
import com.leccionario.backend.demerit.dto.StudentDemerResponse;
import com.leccionario.backend.demerit.service.StudentDemerService;
import jakarta.validation.Valid;
import java.security.Principal;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/student-demers")
@RequiredArgsConstructor
public class StudentDemerController {

    private final StudentDemerService service;

    @GetMapping("/by-student/{studentId}/period/{periodId}")
    @PreAuthorize("hasAuthority('ACADEMIC_VIEW')")
    public ResponseEntity<List<StudentDemerResponse>> findByStudentAndPeriod(
            @PathVariable Long studentId, @PathVariable Long periodId) {
        return ResponseEntity.ok(service.findByStudentAndPeriod(studentId, periodId));
    }

    @GetMapping("/by-course/{courseId}/period/{periodId}")
    @PreAuthorize("hasAuthority('ACADEMIC_VIEW')")
    public ResponseEntity<List<StudentDemerResponse>> findByCourseAndPeriod(
            @PathVariable Long courseId, @PathVariable Long periodId) {
        return ResponseEntity.ok(service.findByCourseAndPeriod(courseId, periodId));
    }

    @GetMapping("/by-teacher/{teacherId}/period/{periodId}")
    @PreAuthorize("hasAuthority('ACADEMIC_VIEW')")
    public ResponseEntity<List<StudentDemerResponse>> findByTeacherAndPeriod(
            @PathVariable Long teacherId, @PathVariable Long periodId) {
        return ResponseEntity.ok(service.findByTeacherAndPeriod(teacherId, periodId));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ACADEMIC_MANAGE')")
    public ResponseEntity<StudentDemerResponse> create(
            @Valid @RequestBody StudentDemerRequest request, Principal principal) {
        return ResponseEntity.ok(service.create(request, principal.getName()));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAuthority('ACADEMIC_MANAGE')")
    public ResponseEntity<StudentDemerResponse> changeStatus(
            @PathVariable Long id,
            @RequestParam String status,
            @RequestParam(required = false) String notes,
            Principal principal) {
        return ResponseEntity.ok(service.changeStatus(id, status, notes, principal.getName()));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ACADEMIC_MANAGE')")
    public ResponseEntity<Void> delete(@PathVariable Long id, Principal principal) {
        service.delete(id, principal.getName());
        return ResponseEntity.noContent().build();
    }
}
