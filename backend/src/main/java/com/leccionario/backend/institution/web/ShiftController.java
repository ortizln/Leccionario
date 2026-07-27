package com.leccionario.backend.institution.web;

import com.leccionario.backend.institution.domain.Shift;
import com.leccionario.backend.institution.service.ShiftService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/institution/shifts")
public class ShiftController {

    private final ShiftService shiftService;

    public ShiftController(ShiftService shiftService) {
        this.shiftService = shiftService;
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Shift shift) {
        return ResponseEntity.ok(shiftService.create(shift));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody Shift shift) {
        return ResponseEntity.ok(shiftService.update(id, shift));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        shiftService.delete(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> findById(@PathVariable Long id) {
        return ResponseEntity.ok(shiftService.findById(id));
    }

    @GetMapping("/institution/{institutionId}")
    public ResponseEntity<?> findByInstitution(@PathVariable Long institutionId) {
        return ResponseEntity.ok(shiftService.findByInstitution(institutionId));
    }
}
