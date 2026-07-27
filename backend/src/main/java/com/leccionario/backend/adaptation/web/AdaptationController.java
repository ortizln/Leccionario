package com.leccionario.backend.adaptation.web;

import com.leccionario.backend.adaptation.CurricularAdaptation;
import com.leccionario.backend.adaptation.AdaptationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/adaptations")
public class AdaptationController {

    private final AdaptationService adaptationService;

    public AdaptationController(AdaptationService adaptationService) {
        this.adaptationService = adaptationService;
    }

    @GetMapping
    public ResponseEntity<?> findAll() {
        return ResponseEntity.ok(adaptationService.findAll());
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody CurricularAdaptation adaptation, Authentication auth) {
        return ResponseEntity.ok(adaptationService.create(adaptation, auth.getName()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody CurricularAdaptation adaptation) {
        return ResponseEntity.ok(adaptationService.update(id, adaptation));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        adaptationService.delete(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> findById(@PathVariable Long id) {
        return ResponseEntity.ok(adaptationService.findById(id));
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<?> findByStudent(@PathVariable Long studentId) {
        return ResponseEntity.ok(adaptationService.findByStudent(studentId));
    }

    @GetMapping("/nee/{neeId}")
    public ResponseEntity<?> findByNEE(@PathVariable Long neeId) {
        return ResponseEntity.ok(adaptationService.findByNEE(neeId));
    }
}
