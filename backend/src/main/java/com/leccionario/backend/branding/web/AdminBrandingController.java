package com.leccionario.backend.branding.web;

import com.leccionario.backend.branding.dto.BrandingAssetResponse;
import com.leccionario.backend.branding.dto.InstitutionBrandingRequest;
import com.leccionario.backend.branding.dto.InstitutionBrandingResponse;
import com.leccionario.backend.branding.service.InstitutionBrandingService;
import jakarta.validation.Valid;
import java.security.Principal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/branding")
@RequiredArgsConstructor
public class AdminBrandingController {

    private final InstitutionBrandingService brandingService;

    @GetMapping("/{institutionId}")
    @PreAuthorize("hasAuthority('SETTINGS_VIEW')")
    public ResponseEntity<InstitutionBrandingResponse> getBranding(@PathVariable Long institutionId) {
        return ResponseEntity.ok(brandingService.findByInstitution(institutionId));
    }

    @PutMapping("/{institutionId}")
    @PreAuthorize("hasAuthority('SETTINGS_MANAGE')")
    public ResponseEntity<InstitutionBrandingResponse> updateBranding(
            @PathVariable Long institutionId,
            @Valid @RequestBody InstitutionBrandingRequest request,
            Principal principal) {
        return ResponseEntity.ok(brandingService.update(institutionId, request, principal.getName()));
    }

    @PostMapping("/assets")
    @PreAuthorize("hasAuthority('SETTINGS_MANAGE')")
    public ResponseEntity<BrandingAssetResponse> uploadAsset(
            @RequestParam("file") MultipartFile file,
            Principal principal) {
        return ResponseEntity.ok(brandingService.uploadAsset(file, principal.getName()));
    }
}
