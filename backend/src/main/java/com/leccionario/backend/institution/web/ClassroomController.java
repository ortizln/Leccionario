package com.leccionario.backend.institution.web;

import com.leccionario.backend.institution.domain.Classroom;
import com.leccionario.backend.institution.service.ClassroomService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/institution/classrooms")
public class ClassroomController {

    private final ClassroomService classroomService;

    public ClassroomController(ClassroomService classroomService) {
        this.classroomService = classroomService;
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Classroom classroom) {
        return ResponseEntity.ok(classroomService.create(classroom));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody Classroom classroom) {
        return ResponseEntity.ok(classroomService.update(id, classroom));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        classroomService.delete(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> findById(@PathVariable Long id) {
        return ResponseEntity.ok(classroomService.findById(id));
    }

    @GetMapping("/institution/{institutionId}")
    public ResponseEntity<?> findByInstitution(@PathVariable Long institutionId) {
        return ResponseEntity.ok(classroomService.findByInstitution(institutionId));
    }

    @GetMapping("/campus/{campusId}")
    public ResponseEntity<?> findByCampus(@PathVariable Long campusId) {
        return ResponseEntity.ok(classroomService.findByCampus(campusId));
    }

    @GetMapping("/type/{classroomType}")
    public ResponseEntity<?> findByType(@PathVariable String classroomType) {
        return ResponseEntity.ok(classroomService.findByType(classroomType));
    }

    @GetMapping("/stats/{institutionId}")
    public ResponseEntity<Map<String, Object>> getStats(@PathVariable Long institutionId) {
        return ResponseEntity.ok(classroomService.getStats(institutionId));
    }
}
