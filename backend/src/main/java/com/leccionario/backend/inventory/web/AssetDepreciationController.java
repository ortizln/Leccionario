package com.leccionario.backend.inventory.web;

import com.leccionario.backend.inventory.*;
import org.springframework.http.ResponseEntity;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/inventory")
@Tag(name = "DepreciaciÃ³n y GarantÃ­as")
public class AssetDepreciationController {

    private final AssetDepreciationService depreciationService;
    private final AssetWarrantyRepository warrantyRepo;

    public AssetDepreciationController(AssetDepreciationService depreciationService, AssetWarrantyRepository warrantyRepo) {
        this.depreciationService = depreciationService;
        this.warrantyRepo = warrantyRepo;
    }

    @Operation(summary = "Obtener depreciaciÃ³n de un activo")
    @GetMapping("/assets/{id}/depreciation")
    public ResponseEntity<Map<String, Object>> getDepreciation(@PathVariable Long id, @RequestParam(defaultValue = "5") int usefulLifeYears) {
        Asset asset = depreciationService.findAll(1L).stream().filter(a -> a.getId().equals(id)).findFirst().orElse(null);
        if (asset == null) return ResponseEntity.notFound().build();
        Map<String, Object> result = new java.util.LinkedHashMap<>();
        result.put("assetId", id);
        result.put("code", asset.getCode());
        result.put("name", asset.getName());
        result.put("purchaseCost", asset.getPurchaseCost());
        result.put("depreciation", depreciationService.calculateDepreciation(asset, usefulLifeYears));
        result.put("currentValue", depreciationService.calculateCurrentValue(asset, usefulLifeYears));
        return ResponseEntity.ok(result);
    }

    @Operation(summary = "Actualizar valores de todos los activos")
    @PostMapping("/assets/update-values")
    public ResponseEntity<Void> updateAllValues(@RequestParam Long institutionId) {
        depreciationService.updateAllCurrentValues(institutionId);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Listar garantÃ­as vigentes")
    @GetMapping("/warranties")
    public ResponseEntity<List<AssetWarranty>> getWarranties(@RequestParam Long institutionId) {
        return ResponseEntity.ok(warrantyRepo.findByInstitutionIdAndStatusOrderByEndDateAsc(institutionId, "VIGENTE"));
    }

    @Operation(summary = "Listar garantÃ­as prÃ³ximas a vencer")
    @GetMapping("/warranties/expiring")
    public ResponseEntity<List<AssetWarranty>> getExpiringWarranties(@RequestParam Long institutionId) {
        return ResponseEntity.ok(depreciationService.getExpiringWarranties(institutionId));
    }

    @Operation(summary = "Crear una nueva garantÃ­a")
    @PostMapping("/warranties")
    public ResponseEntity<AssetWarranty> createWarranty(@RequestBody AssetWarranty w) {
        return ResponseEntity.ok(warrantyRepo.save(w));
    }

    @Operation(summary = "Actualizar una garantÃ­a")
    @PutMapping("/warranties/{id}")
    public ResponseEntity<AssetWarranty> updateWarranty(@PathVariable Long id, @RequestBody AssetWarranty w) {
        w.setId(id);
        return ResponseEntity.ok(warrantyRepo.save(w));
    }

    @Operation(summary = "Obtener una garantÃ­a por ID")
    @GetMapping("/warranties/{id}")
    public ResponseEntity<AssetWarranty> findWarrantyById(@PathVariable Long id) {
        return ResponseEntity.ok(warrantyRepo.findById(id).orElseThrow(() -> new RuntimeException("Garantia no encontrada")));
    }

    @Operation(summary = "Eliminar una garantÃ­a")
    @DeleteMapping("/warranties/{id}")
    public ResponseEntity<Void> deleteWarranty(@PathVariable Long id) {
        warrantyRepo.deleteById(id);
        return ResponseEntity.ok().build();
    }
}