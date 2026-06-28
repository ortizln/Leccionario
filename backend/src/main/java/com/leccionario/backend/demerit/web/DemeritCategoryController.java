package com.leccionario.backend.demerit.web;

import com.leccionario.backend.demerit.dto.DemeritCategoryRequest;
import com.leccionario.backend.demerit.dto.DemeritCategoryResponse;
import com.leccionario.backend.demerit.service.DemeritCategoryService;
import jakarta.validation.Valid;
import java.security.Principal;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/demerit-categories")
@RequiredArgsConstructor
public class DemeritCategoryController {

    private final DemeritCategoryService service;

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ACADEMIC_VIEW', 'LESSONPLAN_MANAGE')")
    public ResponseEntity<List<DemeritCategoryResponse>> findAll() {
        return ResponseEntity.ok(service.findAll());
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ACADEMIC_MANAGE')")
    public ResponseEntity<DemeritCategoryResponse> create(
            @Valid @RequestBody DemeritCategoryRequest request, Principal principal) {
        return ResponseEntity.ok(service.create(request, principal.getName()));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ACADEMIC_MANAGE')")
    public ResponseEntity<DemeritCategoryResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody DemeritCategoryRequest request,
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
