package com.leccionario.backend.institution.web;

import com.leccionario.backend.institution.service.SenescytService;
import com.leccionario.backend.institution.service.ElectronicSignatureService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/institution")
public class InstitutionIntegrationController {

    private final SenescytService senescytService;
    private final ElectronicSignatureService signatureService;

    public InstitutionIntegrationController(SenescytService senescytService, ElectronicSignatureService signatureService) {
        this.senescytService = senescytService;
        this.signatureService = signatureService;
    }

    @GetMapping("/senescyt/validate-teacher")
    public ResponseEntity<Map<String, Object>> validateTeacher(@RequestParam String cedula) {
        return ResponseEntity.ok(senescytService.validateTeacherCredentials(cedula));
    }

    @GetMapping("/senescyt/validate-institution")
    public ResponseEntity<Map<String, Object>> validateInstitution(@RequestParam String ruc) {
        return ResponseEntity.ok(senescytService.validateInstitutionData(ruc));
    }

    @PostMapping("/sign")
    public ResponseEntity<Map<String, String>> signDocument(@RequestBody Map<String, Object> body) {
        String documentType = (String) body.get("documentType");
        Long documentId = Long.valueOf(body.get("documentId").toString());
        Long userId = Long.valueOf(body.get("userId").toString());
        return ResponseEntity.ok(signatureService.generateSignature(documentType, documentId, userId));
    }

    @PostMapping("/sign/verify")
    public ResponseEntity<Map<String, Boolean>> verifySignature(@RequestBody Map<String, String> body) {
        return ResponseEntity.ok(Map.of("valid", signatureService.verifySignature(body.get("signatureId"), body.get("hash"))));
    }
}