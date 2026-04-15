package com.leccionario.backend.branding.web;

import com.leccionario.backend.branding.dto.InstitutionBrandingResponse;
import com.leccionario.backend.branding.dto.PublicInstitutionOptionResponse;
import com.leccionario.backend.branding.service.BrandingAssetService;
import com.leccionario.backend.branding.service.InstitutionBrandingService;
import java.nio.file.Files;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/public")
@RequiredArgsConstructor
public class PublicBrandingController {

    private final InstitutionBrandingService brandingService;
    private final BrandingAssetService brandingAssetService;

    @GetMapping("/institutions")
    public ResponseEntity<List<PublicInstitutionOptionResponse>> getInstitutions() {
        return ResponseEntity.ok(brandingService.findPublicInstitutions());
    }

    @GetMapping("/branding")
    public ResponseEntity<InstitutionBrandingResponse> getBranding(
            @RequestParam(required = false) String institutionCode) {
        return ResponseEntity.ok(brandingService.findPublicBranding(institutionCode));
    }

    @GetMapping("/assets/{fileName:.+}")
    public ResponseEntity<Resource> getAsset(@PathVariable String fileName) {
        Resource resource = brandingAssetService.load(fileName);
        MediaType mediaType = MediaType.APPLICATION_OCTET_STREAM;
        try {
            String detected = Files.probeContentType(resource.getFile().toPath());
            if (detected != null) {
                mediaType = MediaType.parseMediaType(detected);
            }
        } catch (Exception ignored) {
        }
        return ResponseEntity.ok().contentType(mediaType).body(resource);
    }
}
