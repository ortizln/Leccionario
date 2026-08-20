package com.leccionario.backend.inventory;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/inventory")
public class AssetController {

    private final AssetService assetService;

    public AssetController(AssetService assetService) { this.assetService = assetService; }

    @GetMapping("/categories")
    public ResponseEntity<List<AssetCategory>> findAllCategories(@RequestParam Long institutionId) {
        return ResponseEntity.ok(assetService.findAllCategories(institutionId));
    }

    @PostMapping("/categories")
    public ResponseEntity<AssetCategory> createCategory(@RequestBody AssetCategory cat) {
        return ResponseEntity.ok(assetService.createCategory(cat));
    }

    @PutMapping("/categories/{id}")
    public ResponseEntity<AssetCategory> updateCategory(@PathVariable Long id, @RequestBody AssetCategory cat) {
        return ResponseEntity.ok(assetService.updateCategory(id, cat));
    }

    @DeleteMapping("/categories/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        assetService.deleteCategory(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/assets")
    public ResponseEntity<List<Asset>> findAll(@RequestParam Long institutionId) {
        return ResponseEntity.ok(assetService.findAll(institutionId));
    }

    @PostMapping("/assets")
    public ResponseEntity<Asset> create(@RequestBody Asset asset) {
        return ResponseEntity.ok(assetService.create(asset));
    }

    @PutMapping("/assets/{id}")
    public ResponseEntity<Asset> update(@PathVariable Long id, @RequestBody Asset asset) {
        return ResponseEntity.ok(assetService.update(id, asset));
    }

    @PostMapping("/assets/{id}/assign")
    public ResponseEntity<AssetAssignment> assign(@PathVariable Long id, @RequestBody java.util.Map<String, Object> body) {
        String assignedTo = (String) body.get("assignedTo");
        Long userId = body.get("userId") != null ? Long.valueOf(body.get("userId").toString()) : null;
        return ResponseEntity.ok(assetService.assign(id, assignedTo, userId));
    }

    @PostMapping("/assignments/{id}/return")
    public ResponseEntity<AssetAssignment> returnAsset(@PathVariable Long id) {
        return ResponseEntity.ok(assetService.returnAsset(id));
    }

    @GetMapping("/assets/{id}/assignments")
    public ResponseEntity<List<AssetAssignment>> getAssignments(@PathVariable Long id) {
        return ResponseEntity.ok(assetService.getAssignments(id));
    }

    @GetMapping("/assignments")
    public ResponseEntity<List<AssetAssignment>> getAllAssignments() {
        return ResponseEntity.ok(assetService.getAllAssignments());
    }

    @GetMapping("/assignments/stats")
    public ResponseEntity<java.util.Map<String, Object>> getAssignmentStats() {
        return ResponseEntity.ok(assetService.getAssignmentStats());
    }

    @PostMapping("/maintenances")
    public ResponseEntity<AssetMaintenance> createMaintenance(@RequestBody AssetMaintenance m) {
        return ResponseEntity.ok(assetService.createMaintenance(m));
    }

    @PostMapping("/maintenances/{id}/complete")
    public ResponseEntity<AssetMaintenance> completeMaintenance(@PathVariable Long id) {
        return ResponseEntity.ok(assetService.completeMaintenance(id));
    }

    @GetMapping("/assets/{id}/maintenances")
    public ResponseEntity<List<AssetMaintenance>> getMaintenances(@PathVariable Long id) {
        return ResponseEntity.ok(assetService.getMaintenances(id));
    }

    @GetMapping("/maintenances/pending")
    public ResponseEntity<List<AssetMaintenance>> getPendingMaintenances() {
        return ResponseEntity.ok(assetService.getPendingMaintenances());
    }

    @GetMapping("/stats")
    public ResponseEntity<java.util.Map<String, Object>> getStats(@RequestParam Long institutionId) {
        return ResponseEntity.ok(assetService.getAssetStats(institutionId));
    }

    @GetMapping("/assets/status/{status}")
    public ResponseEntity<List<Asset>> findByStatus(@RequestParam Long institutionId, @PathVariable String status) {
        return ResponseEntity.ok(assetService.findByStatus(institutionId, status));
    }

    @GetMapping("/assets/category/{categoryId}")
    public ResponseEntity<List<Asset>> findByCategory(@RequestParam Long institutionId, @PathVariable Long categoryId) {
        return ResponseEntity.ok(assetService.findByCategory(institutionId, categoryId));
    }

    @GetMapping("/assets/search")
    public ResponseEntity<List<Asset>> search(@RequestParam Long institutionId, @RequestParam String name) {
        return ResponseEntity.ok(assetService.searchByName(institutionId, name));
    }

    @GetMapping("/depreciation")
    public ResponseEntity<java.util.Map<String, Object>> getDepreciationReport(@RequestParam Long institutionId) {
        return ResponseEntity.ok(assetService.getDepreciationReport(institutionId));
    }

    @GetMapping("/assets/export")
    public ResponseEntity<byte[]> exportCSV(@RequestParam Long institutionId) {
        List<Asset> assets = assetService.findAll(institutionId);
        StringBuilder csv = new StringBuilder();
        csv.append("Codigo,Nombre,Categoria,Marca,Modelo,Serial,Estado,Condicion,Ubicacion,Valor\n");
        assets.forEach(a -> csv.append(String.format("%s,%s,%s,%s,%s,%s,%s,%s,%s,%s%n",
            a.getCode(), a.getName(), a.getCategoryId(), a.getBrand(), a.getModel(),
            a.getSerialNumber(), a.getStatus(), a.getConditionStatus(), a.getLocation(), a.getCurrentValue())));
        return ResponseEntity.ok()
            .header("Content-Disposition", "attachment; filename=inventario.csv")
            .header("Content-Type", "text/csv; charset=UTF-8")
            .body(csv.toString().getBytes());
    }
}