package com.leccionario.backend.certificates.web;

import com.leccionario.backend.academicpdf.AcademicPdfService;
import com.leccionario.backend.certificates.dto.CertificateRequest;
import com.leccionario.backend.certificates.dto.CertificateResponse;
import com.leccionario.backend.certificates.dto.CertificateTemplateResponse;
import com.leccionario.backend.certificates.service.CertificateService;
import jakarta.validation.Valid;
import java.security.Principal;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/certificates")
@RequiredArgsConstructor
public class CertificateController {

    private final CertificateService certificateService;
    private final AcademicPdfService academicPdfService;

    @GetMapping("/templates")
    @PreAuthorize("hasAuthority('CERTIFICADO_VIEW')")
    public ResponseEntity<List<CertificateTemplateResponse>> getTemplates(@RequestParam Long institutionId) {
        return ResponseEntity.ok(certificateService.getTemplates(institutionId));
    }

    @PostMapping("/generate")
    @PreAuthorize("hasAuthority('CERTIFICADO_MANAGE')")
    public ResponseEntity<CertificateResponse> generate(
            @Valid @RequestBody CertificateRequest request,
            @RequestParam Long institutionId,
            Principal principal) {
        return ResponseEntity.ok(certificateService.generate(request, institutionId, principal.getName()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('CERTIFICADO_VIEW')")
    public ResponseEntity<CertificateResponse> getCertificate(@PathVariable Long id) {
        return ResponseEntity.ok(certificateService.getCertificate(id));
    }

    @GetMapping("/number/{number}")
    @PreAuthorize("hasAuthority('CERTIFICADO_VIEW')")
    public ResponseEntity<CertificateResponse> getByNumber(@PathVariable String number) {
        return ResponseEntity.ok(certificateService.getByNumber(number));
    }

    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasAuthority('CERTIFICADO_VIEW')")
    public ResponseEntity<List<CertificateResponse>> getByStudent(@PathVariable Long studentId) {
        return ResponseEntity.ok(certificateService.getByStudent(studentId));
    }

    @GetMapping("/period/{periodId}")
    @PreAuthorize("hasAuthority('CERTIFICADO_VIEW')")
    public ResponseEntity<List<CertificateResponse>> getByPeriod(@PathVariable Long periodId) {
        return ResponseEntity.ok(certificateService.getByPeriod(periodId));
    }

    @PutMapping("/{id}/issue")
    @PreAuthorize("hasAuthority('CERTIFICADO_MANAGE')")
    public ResponseEntity<CertificateResponse> issue(@PathVariable Long id, Principal principal) {
        return ResponseEntity.ok(certificateService.issue(id, principal.getName()));
    }

    @PutMapping("/{id}/revoke")
    @PreAuthorize("hasAuthority('CERTIFICADO_MANAGE')")
    public ResponseEntity<CertificateResponse> revoke(@PathVariable Long id, Principal principal) {
        return ResponseEntity.ok(certificateService.revoke(id, principal.getName()));
    }

    @GetMapping("/stats/{institutionId}")
    @PreAuthorize("hasAuthority('CERTIFICADO_VIEW')")
    public ResponseEntity<Map<String, Object>> getStats(@PathVariable Long institutionId) {
        return ResponseEntity.ok(certificateService.getStats(institutionId));
    }

    @GetMapping("/{id}/pdf")
    @PreAuthorize("hasAuthority('CERTIFICADO_VIEW')")
    public ResponseEntity<byte[]> downloadPdf(@PathVariable Long id) {
        byte[] pdf = academicPdfService.generateCertificatePdf(id);
        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=certificado_" + id + ".pdf")
                .header("Content-Type", "application/pdf")
                .body(pdf);
    }
}
