package com.leccionario.backend.evaluation.web;

import com.leccionario.backend.evaluation.domain.Competency;
import com.leccionario.backend.evaluation.service.CompetencyService;
import org.springframework.http.ResponseEntity;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/grading/competencies")
@Tag(name = "Competencias")
public class CompetencyController {

    private final CompetencyService service;

    public CompetencyController(CompetencyService service) {
        this.service = service;
    }

    @Operation(summary = "Listar todas las competencias de una institución")
    @GetMapping
    public ResponseEntity<List<Competency>> findAll(@RequestParam Long institutionId) {
        return ResponseEntity.ok(service.findAll(institutionId));
    }

    @Operation(summary = "Listar competencias por tipo")
    @GetMapping("/type")
    public ResponseEntity<List<Competency>> findByType(@RequestParam Long institutionId, @RequestParam String type) {
        return ResponseEntity.ok(service.findByType(institutionId, type));
    }

    @Operation(summary = "Obtener una competencia por ID")
    @GetMapping("/{id}")
    public ResponseEntity<Competency> findById(@PathVariable Long id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @Operation(summary = "Crear una nueva competencia")
    @PostMapping
    public ResponseEntity<Competency> create(@RequestBody Competency competency) {
        return ResponseEntity.ok(service.create(competency));
    }

    @Operation(summary = "Actualizar una competencia existente")
    @PutMapping("/{id}")
    public ResponseEntity<Competency> update(@PathVariable Long id, @RequestBody Competency competency) {
        return ResponseEntity.ok(service.update(id, competency));
    }

    @Operation(summary = "Eliminar una competencia")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.ok().build();
    }
}
