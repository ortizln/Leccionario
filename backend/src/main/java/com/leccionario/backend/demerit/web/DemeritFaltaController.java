package com.leccionario.backend.demerit.web;

import com.leccionario.backend.demerit.dto.DemeritFaltaRequest;
import com.leccionario.backend.demerit.dto.DemeritFaltaResponse;
import com.leccionario.backend.demerit.service.DemeritFaltaService;
import jakarta.validation.Valid;
import java.security.Principal;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/demerit-faltas")
@RequiredArgsConstructor
public class DemeritFaltaController {

    private final DemeritFaltaService service;

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ACADEMIC_VIEW', 'LESSONPLAN_MANAGE')")
    public ResponseEntity<List<DemeritFaltaResponse>> findAll() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/active")
    @PreAuthorize("hasAnyAuthority('ACADEMIC_VIEW', 'LESSONPLAN_MANAGE')")
    public ResponseEntity<List<DemeritFaltaResponse>> findActive() {
        return ResponseEntity.ok(service.findActiveOptions());
    }

    @GetMapping("/by-category/{categoryId}")
    @PreAuthorize("hasAuthority('ACADEMIC_VIEW')")
    public ResponseEntity<List<DemeritFaltaResponse>> findByCategory(@PathVariable Long categoryId) {
        return ResponseEntity.ok(service.findByCategory(categoryId));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ACADEMIC_MANAGE')")
    public ResponseEntity<DemeritFaltaResponse> create(
            @Valid @RequestBody DemeritFaltaRequest request, Principal principal) {
        return ResponseEntity.ok(service.create(request, principal.getName()));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ACADEMIC_MANAGE')")
    public ResponseEntity<DemeritFaltaResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody DemeritFaltaRequest request,
            Principal principal) {
        return ResponseEntity.ok(service.update(id, request, principal.getName()));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ACADEMIC_MANAGE')")
    public ResponseEntity<Void> delete(@PathVariable Long id, Principal principal) {
        service.delete(id, principal.getName());
        return ResponseEntity.noContent().build();
    }
}
