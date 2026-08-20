package com.leccionario.backend.enrollment.web;

import com.leccionario.backend.enrollment.Enrollment;
import com.leccionario.backend.enrollment.EnrollmentService;
import com.leccionario.backend.enrollment.dto.EnrollmentDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/enrollment")
public class EnrollmentController {

    private final EnrollmentService enrollmentService;

    public EnrollmentController(EnrollmentService enrollmentService) {
        this.enrollmentService = enrollmentService;
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Enrollment enrollment, Authentication auth) {
        return ResponseEntity.ok(enrollmentService.create(enrollment, auth.getName()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody Enrollment enrollment) {
        return ResponseEntity.ok(enrollmentService.update(id, enrollment));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        enrollmentService.delete(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> findById(@PathVariable Long id) {
        return ResponseEntity.ok(enrollmentService.findById(id));
    }

    @GetMapping("/period/{periodId}")
    public ResponseEntity<Page<EnrollmentDTO>> findByPeriod(
            @PathVariable Long periodId,
            @PageableDefault(size = 50) Pageable pageable) {
        return ResponseEntity.ok(enrollmentService.findByPeriod(periodId, pageable));
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<?> findByStudent(@PathVariable Long studentId) {
        return ResponseEntity.ok(enrollmentService.findByStudent(studentId));
    }

    @GetMapping("/course/{courseId}/period/{periodId}")
    public ResponseEntity<?> findByCourseAndPeriod(
            @PathVariable Long courseId, @PathVariable Long periodId) {
        return ResponseEntity.ok(enrollmentService.findByCourseAndPeriod(courseId, periodId));
    }

    @GetMapping("/stats/{periodId}")
    public ResponseEntity<Map<String, Object>> getStats(@PathVariable Long periodId) {
        return ResponseEntity.ok(enrollmentService.getStats(periodId));
    }
}
