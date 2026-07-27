package com.leccionario.backend.inventory;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/inventory/custodians")
@CrossOrigin(origins = "*")
public class AssetCustodianController {
    private final AssetCustodianService service;
    public AssetCustodianController(AssetCustodianService service) { this.service = service; }

    @GetMapping
    public ResponseEntity<List<AssetCustodian>> findAll(@RequestParam Long institutionId) {
        return ResponseEntity.ok(service.findAll(institutionId));
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<AssetCustodian>> findByEmployee(@PathVariable Long employeeId) {
        return ResponseEntity.ok(service.findByEmployee(employeeId));
    }

    @PostMapping
    public ResponseEntity<AssetCustodian> assign(@RequestBody AssetCustodian c) {
        return ResponseEntity.ok(service.assign(c));
    }

    @PostMapping("/{id}/return")
    public ResponseEntity<AssetCustodian> returnAsset(@PathVariable Long id) {
        return ResponseEntity.ok(service.returnAsset(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
