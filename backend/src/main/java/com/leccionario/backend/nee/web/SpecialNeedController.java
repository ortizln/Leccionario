package com.leccionario.backend.nee.web;

import com.leccionario.backend.nee.SpecialNeed;
import com.leccionario.backend.nee.SpecialNeedService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/nee")
public class SpecialNeedController {

    private final SpecialNeedService specialNeedService;

    public SpecialNeedController(SpecialNeedService specialNeedService) {
        this.specialNeedService = specialNeedService;
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody SpecialNeed specialNeed, Authentication auth) {
        return ResponseEntity.ok(specialNeedService.create(specialNeed, auth.getName()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody SpecialNeed specialNeed) {
        return ResponseEntity.ok(specialNeedService.update(id, specialNeed));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        specialNeedService.delete(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> findById(@PathVariable Long id) {
        return ResponseEntity.ok(specialNeedService.findById(id));
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<?> findByStudent(@PathVariable Long studentId) {
        return ResponseEntity.ok(specialNeedService.findByStudent(studentId));
    }

    @GetMapping("/active")
    public ResponseEntity<?> findAllActive() {
        return ResponseEntity.ok(specialNeedService.findAllActive());
    }

    @GetMapping("/type/{needType}")
    public ResponseEntity<?> findByType(@PathVariable String needType) {
        return ResponseEntity.ok(specialNeedService.findByType(needType));
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        return ResponseEntity.ok(specialNeedService.getStats());
    }
}
