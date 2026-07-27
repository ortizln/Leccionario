package com.leccionario.backend.communication;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/communication/circulars")
@CrossOrigin(origins = "*")
public class CircularController {
    private final CircularService service;
    public CircularController(CircularService service) { this.service = service; }

    @GetMapping
    public ResponseEntity<List<Circular>> findAll(@RequestParam Long institutionId) {
        return ResponseEntity.ok(service.findAll(institutionId));
    }

    @GetMapping("/published")
    public ResponseEntity<List<Circular>> findPublished(@RequestParam Long institutionId) {
        return ResponseEntity.ok(service.findPublished(institutionId));
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<Circular>> findByCategory(@RequestParam Long institutionId, @PathVariable String category) {
        return ResponseEntity.ok(service.findByCategory(institutionId, category));
    }

    @PostMapping
    public ResponseEntity<Circular> save(@RequestBody Circular circular) {
        return ResponseEntity.ok(service.save(circular));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
