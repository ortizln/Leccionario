package com.leccionario.backend.rrhh.web;

import com.leccionario.backend.rrhh.TrainingCourse;
import com.leccionario.backend.rrhh.TrainingEnrollment;
import com.leccionario.backend.rrhh.TrainingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/hr/training")
public class TrainingController {

    private final TrainingService trainingService;

    public TrainingController(TrainingService trainingService) { this.trainingService = trainingService; }

    @GetMapping("/courses")
    public ResponseEntity<List<TrainingCourse>> findAllCourses(@RequestParam Long institutionId) {
        return ResponseEntity.ok(trainingService.findCourses(institutionId));
    }

    @PostMapping("/courses")
    public ResponseEntity<TrainingCourse> createCourse(@RequestBody TrainingCourse course) {
        return ResponseEntity.ok(trainingService.createCourse(course));
    }

    @PutMapping("/courses/{id}")
    public ResponseEntity<TrainingCourse> updateCourse(@PathVariable Long id, @RequestBody TrainingCourse course) {
        return ResponseEntity.ok(trainingService.updateCourse(id, course));
    }

    @DeleteMapping("/courses/{id}")
    public ResponseEntity<Void> deleteCourse(@PathVariable Long id) {
        trainingService.deleteCourse(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/courses/{id}/enrollments")
    public ResponseEntity<List<TrainingEnrollment>> getEnrollments(@PathVariable Long id) {
        return ResponseEntity.ok(trainingService.findEnrollmentsByCourse(id));
    }

    @PostMapping("/courses/{id}/enroll")
    public ResponseEntity<TrainingEnrollment> enroll(@PathVariable Long id, @RequestBody java.util.Map<String, Object> body) {
        Long employeeId = Long.valueOf(body.get("employeeId").toString());
        return ResponseEntity.ok(trainingService.enrollEmployee(id, employeeId));
    }

    @PostMapping("/enrollments/{id}/complete")
    public ResponseEntity<TrainingEnrollment> completeEnrollment(@PathVariable Long id) {
        return ResponseEntity.ok(trainingService.completeEnrollment(id, null));
    }
}