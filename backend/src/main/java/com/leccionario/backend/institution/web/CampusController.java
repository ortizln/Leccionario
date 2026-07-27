package com.leccionario.backend.institution.web;

import com.leccionario.backend.institution.domain.Campus;
import com.leccionario.backend.institution.service.CampusService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/institution/campus")
public class CampusController {

    private final CampusService campusService;

    public CampusController(CampusService campusService) {
        this.campusService = campusService;
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Campus campus) {
        return ResponseEntity.ok(campusService.create(campus));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody Campus campus) {
        return ResponseEntity.ok(campusService.update(id, campus));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        campusService.delete(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> findById(@PathVariable Long id) {
        return ResponseEntity.ok(campusService.findById(id));
    }

    @GetMapping("/institution/{institutionId}")
    public ResponseEntity<?> findByInstitution(@PathVariable Long institutionId) {
        return ResponseEntity.ok(campusService.findByInstitution(institutionId));
    }
}
