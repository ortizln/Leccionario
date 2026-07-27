package com.leccionario.backend.rrhh.web;

import com.leccionario.backend.rrhh.StaffPermission;
import com.leccionario.backend.rrhh.StaffPermissionRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/hr/permissions")
@CrossOrigin(origins = "*")
public class StaffPermissionController {

    private final StaffPermissionRepository repository;

    public StaffPermissionController(StaffPermissionRepository repository) { this.repository = repository; }

    @GetMapping
    public ResponseEntity<List<StaffPermission>> findAll(@RequestParam Long employeeId) {
        return ResponseEntity.ok(repository.findByEmployeeIdOrderByStartDateDesc(employeeId));
    }

    @GetMapping("/pending")
    public ResponseEntity<List<StaffPermission>> findPending() {
        return ResponseEntity.ok(repository.findByStatusOrderByStartDateDesc("PENDIENTE"));
    }

    @PostMapping
    public ResponseEntity<StaffPermission> create(@RequestBody StaffPermission sp) {
        return ResponseEntity.ok(repository.save(sp));
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<StaffPermission> approve(@PathVariable Long id) {
        StaffPermission sp = repository.findById(id).orElseThrow(() -> new RuntimeException("Not found"));
        sp.setStatus("APROBADO");
        return ResponseEntity.ok(repository.save(sp));
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<StaffPermission> reject(@PathVariable Long id) {
        StaffPermission sp = repository.findById(id).orElseThrow(() -> new RuntimeException("Not found"));
        sp.setStatus("RECHAZADO");
        return ResponseEntity.ok(repository.save(sp));
    }
}
