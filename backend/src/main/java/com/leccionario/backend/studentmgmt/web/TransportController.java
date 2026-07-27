package com.leccionario.backend.studentmgmt.web;

import com.leccionario.backend.studentmgmt.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/transport")
public class TransportController {

    private final TransportService transportService;

    public TransportController(TransportService transportService) { this.transportService = transportService; }

    @PostMapping("/routes")
    public ResponseEntity<?> createRoute(@RequestBody TransportRoute route) { return ResponseEntity.ok(transportService.createRoute(route)); }

    @PutMapping("/routes/{id}")
    public ResponseEntity<?> updateRoute(@PathVariable Long id, @RequestBody TransportRoute route) { return ResponseEntity.ok(transportService.updateRoute(id, route)); }

    @DeleteMapping("/routes/{id}")
    public ResponseEntity<?> deleteRoute(@PathVariable Long id) { transportService.deleteRoute(id); return ResponseEntity.ok().build(); }

    @GetMapping("/routes/institution/{institutionId}")
    public ResponseEntity<?> findRoutes(@PathVariable Long institutionId) { return ResponseEntity.ok(transportService.findRoutes(institutionId)); }

    @PostMapping("/assign")
    public ResponseEntity<?> assignStudent(@RequestBody TransportAssignment a) { return ResponseEntity.ok(transportService.assignStudent(a)); }

    @DeleteMapping("/assignments/{id}")
    public ResponseEntity<?> unassignStudent(@PathVariable Long id) { transportService.unassignStudent(id); return ResponseEntity.ok().build(); }

    @GetMapping("/routes/{routeId}/assignments")
    public ResponseEntity<?> findAssignments(@PathVariable Long routeId) { return ResponseEntity.ok(transportService.findAssignments(routeId)); }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<?> findStudentRoute(@PathVariable Long studentId) { return ResponseEntity.ok(transportService.findStudentRoute(studentId)); }

    @GetMapping("/routes/{routeId}/stats")
    public ResponseEntity<Map<String, Object>> getRouteStats(@PathVariable Long routeId) { return ResponseEntity.ok(transportService.getRouteStats(routeId)); }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getInstitutionStats(@RequestParam Long institutionId) { return ResponseEntity.ok(transportService.getInstitutionStats(institutionId)); }

    @GetMapping("/routes")
    public ResponseEntity<?> findAllRoutes(@RequestParam Long institutionId) { return ResponseEntity.ok(transportService.findAllRoutes(institutionId)); }
}
