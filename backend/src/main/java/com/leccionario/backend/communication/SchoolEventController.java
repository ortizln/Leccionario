package com.leccionario.backend.communication;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/communication/events")
public class SchoolEventController {
    private final SchoolEventService service;
    public SchoolEventController(SchoolEventService service) { this.service = service; }

    @GetMapping
    public ResponseEntity<List<SchoolEvent>> findAll(@RequestParam Long institutionId) {
        return ResponseEntity.ok(service.findAll(institutionId));
    }

    @GetMapping("/upcoming")
    public ResponseEntity<List<SchoolEvent>> findUpcoming(@RequestParam Long institutionId) {
        return ResponseEntity.ok(service.findUpcoming(institutionId));
    }

    @GetMapping("/type/{type}")
    public ResponseEntity<List<SchoolEvent>> findByType(@RequestParam Long institutionId, @PathVariable String type) {
        return ResponseEntity.ok(service.findByType(institutionId, type));
    }

    @PostMapping
    public ResponseEntity<SchoolEvent> save(@RequestBody SchoolEvent event) {
        return ResponseEntity.ok(service.save(event));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}