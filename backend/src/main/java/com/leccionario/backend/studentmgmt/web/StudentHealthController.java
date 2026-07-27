package com.leccionario.backend.studentmgmt.web;

import com.leccionario.backend.studentmgmt.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/student-health")
public class StudentHealthController {

    private final StudentHealthService healthService;

    public StudentHealthController(StudentHealthService healthService) { this.healthService = healthService; }

    @PostMapping("/records")
    public ResponseEntity<?> saveRecord(@RequestBody StudentHealthRecord record) { return ResponseEntity.ok(healthService.saveHealthRecord(record)); }

    @GetMapping("/records/student/{studentId}")
    public ResponseEntity<?> getRecord(@PathVariable Long studentId) { return ResponseEntity.ok(healthService.getHealthRecord(studentId)); }

    @DeleteMapping("/records/{id}")
    public ResponseEntity<?> deleteRecord(@PathVariable Long id) { healthService.deleteHealthRecord(id); return ResponseEntity.ok().build(); }

    @PostMapping("/vaccinations")
    public ResponseEntity<?> addVaccination(@RequestBody StudentVaccination v) { return ResponseEntity.ok(healthService.addVaccination(v)); }

    @GetMapping("/vaccinations/student/{studentId}")
    public ResponseEntity<?> getVaccinations(@PathVariable Long studentId) { return ResponseEntity.ok(healthService.getVaccinations(studentId)); }

    @DeleteMapping("/vaccinations/{id}")
    public ResponseEntity<?> deleteVaccination(@PathVariable Long id) { healthService.deleteVaccination(id); return ResponseEntity.ok().build(); }
}
