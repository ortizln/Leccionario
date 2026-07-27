package com.leccionario.backend.evaluation.web;

import com.leccionario.backend.evaluation.domain.Rubric;
import com.leccionario.backend.evaluation.service.RubricService;
import org.springframework.http.ResponseEntity;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/grading/rubrics")
@Tag(name = "Rúbricas")
public class RubricController {

    private final RubricService service;

    public RubricController(RubricService service) {
        this.service = service;
    }

    @Operation(summary = "Listar todas las rúbricas de una institución")
    @GetMapping
    public ResponseEntity<List<Rubric>> findAll(@RequestParam Long institutionId) {
        return ResponseEntity.ok(service.findAll(institutionId));
    }

    @Operation(summary = "Obtener una rúbrica por ID")
    @GetMapping("/{id}")
    public ResponseEntity<Rubric> findById(@PathVariable Long id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @Operation(summary = "Crear una nueva rúbrica")
    @PostMapping
    public ResponseEntity<Rubric> create(@RequestBody Rubric rubric) {
        return ResponseEntity.ok(service.create(rubric));
    }

    @Operation(summary = "Actualizar una rúbrica existente")
    @PutMapping("/{id}")
    public ResponseEntity<Rubric> update(@PathVariable Long id, @RequestBody Rubric rubric) {
        return ResponseEntity.ok(service.update(id, rubric));
    }

    @Operation(summary = "Eliminar una rúbrica")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.ok().build();
    }
}
