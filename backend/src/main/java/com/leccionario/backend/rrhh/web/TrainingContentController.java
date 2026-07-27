package com.leccionario.backend.rrhh.web;

import com.leccionario.backend.rrhh.TrainingContent;
import com.leccionario.backend.rrhh.TrainingContentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/hr/training-content")
@CrossOrigin(origins = "*")
public class TrainingContentController {
    private final TrainingContentService service;
    public TrainingContentController(TrainingContentService service) { this.service = service; }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<TrainingContent>> findByCourse(@PathVariable Long courseId) {
        return ResponseEntity.ok(service.findByCourse(courseId));
    }
    @PostMapping
    public ResponseEntity<TrainingContent> create(@RequestBody TrainingContent c) { return ResponseEntity.ok(service.save(c)); }
    @PutMapping("/{id}")
    public ResponseEntity<TrainingContent> update(@PathVariable Long id, @RequestBody TrainingContent c) { c.setId(id); return ResponseEntity.ok(service.save(c)); }
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) { service.delete(id); return ResponseEntity.ok().build(); }
}
