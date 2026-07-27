package com.leccionario.backend.rrhh.web;

import com.leccionario.backend.rrhh.Vacancy;
import com.leccionario.backend.rrhh.VacancyService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/hr/vacancies")
@CrossOrigin(origins = "*")
public class VacancyController {
    private final VacancyService service;
    public VacancyController(VacancyService service) { this.service = service; }

    @GetMapping
    public ResponseEntity<List<Vacancy>> findAll(@RequestParam Long institutionId) {
        return ResponseEntity.ok(service.findAll(institutionId));
    }
    @GetMapping("/open")
    public ResponseEntity<List<Vacancy>> findOpen(@RequestParam Long institutionId) {
        return ResponseEntity.ok(service.findOpen(institutionId));
    }
    @PostMapping
    public ResponseEntity<Vacancy> create(@RequestBody Vacancy v) { return ResponseEntity.ok(service.save(v)); }
    @PutMapping("/{id}")
    public ResponseEntity<Vacancy> update(@PathVariable Long id, @RequestBody Vacancy v) { v.setId(id); return ResponseEntity.ok(service.save(v)); }
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) { service.delete(id); return ResponseEntity.ok().build(); }
}
