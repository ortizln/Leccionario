package com.leccionario.backend.sri.web;

import com.leccionario.backend.sri.SriService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.Map;

@RestController
@RequestMapping("/api/sri")
@Tag(name = "SRI - Servicio de Rentas Internas")
public class SriController {

    private final SriService sriService;

    public SriController(SriService sriService) {
        this.sriService = sriService;
    }

    @Operation(summary = "Validar documento tributario en el SRI")
    @PostMapping("/validate")
    public ResponseEntity<Map<String, String>> validateDocument(
            @RequestParam String rucEmisor, @RequestParam String claveAcceso) {
        return ResponseEntity.ok(sriService.validateTaxDocument(rucEmisor, claveAcceso));
    }

    @Operation(summary = "Consultar estado de comprobante")
    @GetMapping("/status/{claveAcceso}")
    public ResponseEntity<Map<String, Object>> getDocumentStatus(@PathVariable String claveAcceso) {
        return ResponseEntity.ok(sriService.getDocumentStatus(claveAcceso));
    }

    @Operation(summary = "Enviar comprobante al SRI")
    @PostMapping("/send")
    public ResponseEntity<Map<String, String>> sendDocument(
            @RequestBody String xmlContent, @RequestParam String tipoComprobante) {
        return ResponseEntity.ok(sriService.sendDocument(xmlContent, tipoComprobante));
    }

    @Operation(summary = "Verificar estado de certificado digital")
    @GetMapping("/certificate/{ruc}")
    public ResponseEntity<Map<String, Object>> getCertificateStatus(@PathVariable String ruc) {
        return ResponseEntity.ok(sriService.getCertificateStatus(ruc));
    }
}