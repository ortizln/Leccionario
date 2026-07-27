package com.leccionario.backend.academic.web;

import com.leccionario.backend.academic.domain.AcademicPeriod;
import com.leccionario.backend.academic.repository.AcademicPeriodRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/institution/periods")
public class AcademicPeriodController {

    private final AcademicPeriodRepository repository;

    public AcademicPeriodController(AcademicPeriodRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public ResponseEntity<List<AcademicPeriod>> findAll(@RequestParam Long institutionId) {
        return ResponseEntity.ok(repository.findByInstitutionIdOrderByStartDateDesc(institutionId));
    }

    @GetMapping("/active")
    public ResponseEntity<List<AcademicPeriod>> findActive(@RequestParam Long institutionId) {
        return ResponseEntity.ok(repository.findByInstitutionIdAndActiveTrue(institutionId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AcademicPeriod> findById(@PathVariable Long id) {
        return ResponseEntity.ok(repository.findById(id).orElseThrow(() -> new RuntimeException("Periodo no encontrado")));
    }

    @PostMapping
    public ResponseEntity<AcademicPeriod> create(@RequestBody AcademicPeriod period) {
        return ResponseEntity.ok(repository.save(period));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AcademicPeriod> update(@PathVariable Long id, @RequestBody AcademicPeriod data) {
        AcademicPeriod p = repository.findById(id).orElseThrow(() -> new RuntimeException("Periodo no encontrado"));
        p.setName(data.getName());
        p.setCode(data.getCode());
        p.setPeriodType(data.getPeriodType());
        p.setStartDate(data.getStartDate());
        p.setEndDate(data.getEndDate());
        p.setActive(data.isActive());
        return ResponseEntity.ok(repository.save(p));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        repository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/activate")
    public ResponseEntity<AcademicPeriod> activate(@PathVariable Long id) {
        AcademicPeriod p = repository.findById(id).orElseThrow(() -> new RuntimeException("Periodo no encontrado"));
        p.setActive(true);
        return ResponseEntity.ok(repository.save(p));
    }

    @PutMapping("/{id}/deactivate")
    public ResponseEntity<AcademicPeriod> deactivate(@PathVariable Long id) {
        AcademicPeriod p = repository.findById(id).orElseThrow(() -> new RuntimeException("Periodo no encontrado"));
        p.setActive(false);
        return ResponseEntity.ok(repository.save(p));
    }
}
