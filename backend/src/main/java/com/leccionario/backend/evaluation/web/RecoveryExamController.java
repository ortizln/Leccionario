package com.leccionario.backend.evaluation.web;

import com.leccionario.backend.evaluation.domain.RecoveryExam;
import com.leccionario.backend.evaluation.service.RecoveryExamService;
import org.springframework.http.ResponseEntity;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/grading/recoveries")
@Tag(name = "Exámenes de Recuperación")
public class RecoveryExamController {

    private final RecoveryExamService service;

    public RecoveryExamController(RecoveryExamService service) {
        this.service = service;
    }

    @Operation(summary = "Listar todos los exámenes de recuperación")
    @GetMapping
    public ResponseEntity<List<RecoveryExam>> findAll(@RequestParam Long institutionId) {
        return ResponseEntity.ok(service.findAll(institutionId));
    }

    @Operation(summary = "Listar exámenes pendientes")
    @GetMapping("/pending")
    public ResponseEntity<List<RecoveryExam>> findPending(@RequestParam Long institutionId) {
        return ResponseEntity.ok(service.findPending(institutionId));
    }

    @Operation(summary = "Listar exámenes de un estudiante")
    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<RecoveryExam>> findByStudent(@PathVariable Long studentId) {
        return ResponseEntity.ok(service.findByStudent(studentId));
    }

    @Operation(summary = "Obtener un examen de recuperación por ID")
    @GetMapping("/{id}")
    public ResponseEntity<RecoveryExam> findById(@PathVariable Long id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @Operation(summary = "Crear un nuevo examen de recuperación")
    @PostMapping
    public ResponseEntity<RecoveryExam> create(@RequestBody RecoveryExam exam) {
        return ResponseEntity.ok(service.create(exam));
    }

    @Operation(summary = "Actualizar un examen de recuperación")
    @PutMapping("/{id}")
    public ResponseEntity<RecoveryExam> update(@PathVariable Long id, @RequestBody RecoveryExam exam) {
        return ResponseEntity.ok(service.update(id, exam));
    }

    @Operation(summary = "Aplicar calificación a un examen")
    @PutMapping("/{id}/score")
    public ResponseEntity<RecoveryExam> applyScore(@PathVariable Long id, @RequestBody Map<String, BigDecimal> body) {
        return ResponseEntity.ok(service.applyScore(id, body.get("score")));
    }

    @Operation(summary = "Cancelar un examen de recuperación")
    @PutMapping("/{id}/cancel")
    public ResponseEntity<Void> cancel(@PathVariable Long id) {
        service.cancel(id);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Eliminar un examen de recuperación")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.ok().build();
    }
}
