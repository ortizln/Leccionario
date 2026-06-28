package com.leccionario.backend.demerit.web;

import com.leccionario.backend.common.excel.ImportSummaryResponse;
import com.leccionario.backend.demerit.dto.DemeritOptionResponse;
import com.leccionario.backend.demerit.dto.DemeritRequest;
import com.leccionario.backend.demerit.dto.DemeritResponse;
import com.leccionario.backend.demerit.service.DemeritService;
import jakarta.validation.Valid;
import java.security.Principal;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/demerits")
@RequiredArgsConstructor
public class DemeritController {

    private final DemeritService demeritService;

    @GetMapping
    @PreAuthorize("hasAuthority('ACADEMIC_VIEW')")
    public ResponseEntity<List<DemeritResponse>> findAll() {
        return ResponseEntity.ok(demeritService.findAll());
    }

    @GetMapping("/active")
    @PreAuthorize("hasAnyAuthority('ACADEMIC_VIEW', 'LESSONPLAN_MANAGE')")
    public ResponseEntity<List<DemeritOptionResponse>> findActive() {
        return ResponseEntity.ok(demeritService.findActiveOptions());
    }

    @GetMapping("/import-template")
    @PreAuthorize("hasAuthority('ACADEMIC_VIEW')")
    public ResponseEntity<ByteArrayResource> downloadTemplate() {
        byte[] file = demeritService.exportTemplate();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=demeritos-plantilla.xlsx")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(new ByteArrayResource(file));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ACADEMIC_MANAGE')")
    public ResponseEntity<DemeritResponse> create(@Valid @RequestBody DemeritRequest request, Principal principal) {
        return ResponseEntity.ok(demeritService.create(request, principal.getName()));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ACADEMIC_MANAGE')")
    public ResponseEntity<DemeritResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody DemeritRequest request,
            Principal principal) {
        return ResponseEntity.ok(demeritService.update(id, request, principal.getName()));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ACADEMIC_MANAGE')")
    public ResponseEntity<Void> delete(@PathVariable Long id, Principal principal) {
        demeritService.delete(id, principal.getName());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/import")
    @PreAuthorize("hasAuthority('ACADEMIC_MANAGE')")
    public ResponseEntity<ImportSummaryResponse> importExcel(
            @RequestParam("file") MultipartFile file,
            Principal principal) {
        return ResponseEntity.ok(demeritService.importExcel(file, principal.getName()));
    }
}
