package com.leccionario.backend.inventory;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Service
public class AssetService {

    private final AssetCategoryRepository categoryRepository;
    private final AssetRepository assetRepository;
    private final AssetAssignmentRepository assignmentRepository;
    private final AssetMaintenanceRepository maintenanceRepository;

    public AssetService(AssetCategoryRepository categoryRepository, AssetRepository assetRepository,
                        AssetAssignmentRepository assignmentRepository, AssetMaintenanceRepository maintenanceRepository) {
        this.categoryRepository = categoryRepository;
        this.assetRepository = assetRepository;
        this.assignmentRepository = assignmentRepository;
        this.maintenanceRepository = maintenanceRepository;
    }

    public List<AssetCategory> findAllCategories(Long institutionId) {
        return categoryRepository.findByInstitutionIdOrderByNameAsc(institutionId);
    }

    @Transactional
    public AssetCategory createCategory(AssetCategory cat) {
        return categoryRepository.save(cat);
    }

    @Transactional
    public AssetCategory updateCategory(Long id, AssetCategory updated) {
        AssetCategory cat = categoryRepository.findById(id).orElseThrow(() -> new RuntimeException("Category not found"));
        cat.setName(updated.getName());
        cat.setDescription(updated.getDescription());
        cat.setDepreciationRate(updated.getDepreciationRate());
        cat.setUsefulLifeYears(updated.getUsefulLifeYears());
        cat.setActive(updated.getActive());
        return categoryRepository.save(cat);
    }

    @Transactional
    public void deleteCategory(Long id) { categoryRepository.deleteById(id); }

    public List<Asset> findAll(Long institutionId) {
        return assetRepository.findByInstitutionIdOrderByCodeAsc(institutionId);
    }

    @Transactional
    public Asset create(Asset asset) {
        return assetRepository.save(asset);
    }

    @Transactional
    public Asset update(Long id, Asset updated) {
        Asset asset = assetRepository.findById(id).orElseThrow(() -> new RuntimeException("Asset not found"));
        asset.setName(updated.getName());
        asset.setDescription(updated.getDescription());
        asset.setBrand(updated.getBrand());
        asset.setModel(updated.getModel());
        asset.setSerialNumber(updated.getSerialNumber());
        asset.setConditionStatus(updated.getConditionStatus());
        asset.setStatus(updated.getStatus());
        asset.setLocation(updated.getLocation());
        asset.setCurrentValue(updated.getCurrentValue());
        return assetRepository.save(asset);
    }

    @Transactional
    public AssetAssignment assign(Long assetId, String assignedTo, Long userId) {
        Asset asset = assetRepository.findById(assetId).orElseThrow(() -> new RuntimeException("Asset not found"));
        asset.setStatus("ASIGNADO");
        assetRepository.save(asset);
        AssetAssignment a = new AssetAssignment();
        a.setAssetId(assetId);
        a.setAssignedTo(assignedTo);
        a.setUserId(userId);
        return assignmentRepository.save(a);
    }

    @Transactional
    public AssetAssignment returnAsset(Long assignmentId) {
        AssetAssignment a = assignmentRepository.findById(assignmentId).orElseThrow(() -> new RuntimeException("Assignment not found"));
        a.setStatus("DEVUELTA");
        a.setReturnDate(LocalDate.now());
        Asset asset = assetRepository.findById(a.getAssetId()).orElseThrow();
        asset.setStatus("DISPONIBLE");
        assetRepository.save(asset);
        return assignmentRepository.save(a);
    }

    public List<AssetAssignment> getAssignments(Long assetId) {
        return assignmentRepository.findByAssetIdOrderByCreatedAtDesc(assetId);
    }

    public List<AssetAssignment> getAllAssignments() {
        return assignmentRepository.findAllByOrderByCreatedAtDesc();
    }

    public Map<String, Object> getAssignmentStats() {
        Map<String, Object> stats = new java.util.HashMap<>();
        stats.put("total", assignmentRepository.count());
        stats.put("active", assignmentRepository.countByStatus("ACTIVA"));
        stats.put("returned", assignmentRepository.countByStatus("DEVUELTA"));
        return stats;
    }

    @Transactional
    public AssetMaintenance createMaintenance(AssetMaintenance m) {
        Asset asset = assetRepository.findById(m.getAssetId()).orElseThrow(() -> new RuntimeException("Asset not found"));
        asset.setStatus("MANTENIMIENTO");
        assetRepository.save(asset);
        return maintenanceRepository.save(m);
    }

    @Transactional
    public AssetMaintenance completeMaintenance(Long id) {
        AssetMaintenance m = maintenanceRepository.findById(id).orElseThrow(() -> new RuntimeException("Maintenance not found"));
        m.setStatus("COMPLETADO");
        m.setCompletedDate(LocalDate.now());
        Asset asset = assetRepository.findById(m.getAssetId()).orElseThrow();
        asset.setStatus("DISPONIBLE");
        assetRepository.save(asset);
        return maintenanceRepository.save(m);
    }

    public List<AssetMaintenance> getMaintenances(Long assetId) {
        return maintenanceRepository.findByAssetIdOrderByScheduledDateDesc(assetId);
    }

    public List<AssetMaintenance> getPendingMaintenances() {
        return maintenanceRepository.findByStatusOrderByScheduledDateAsc("PENDIENTE");
    }

    public java.util.Map<String, Object> getAssetStats(Long institutionId) {
        List<Asset> assets = assetRepository.findByInstitutionIdOrderByCodeAsc(institutionId);
        java.util.Map<String, Object> stats = new java.util.HashMap<>();
        stats.put("totalAssets", assets.size());
        stats.put("available", assets.stream().filter(a -> "DISPONIBLE".equals(a.getStatus())).count());
        stats.put("assigned", assets.stream().filter(a -> "ASIGNADO".equals(a.getStatus())).count());
        stats.put("maintenance", assets.stream().filter(a -> "MANTENIMIENTO".equals(a.getStatus())).count());
        stats.put("retired", assets.stream().filter(a -> "RETIRADO".equals(a.getStatus())).count());
        stats.put("totalValue", assets.stream().map(a -> a.getCurrentValue() != null ? a.getCurrentValue() : java.math.BigDecimal.ZERO).reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add));
        java.util.Map<String, Long> byCategory = new java.util.HashMap<>();
        java.util.Map<String, Long> byCondition = new java.util.HashMap<>();
        assets.forEach(a -> {
            String cat = a.getCategoryId() != null ? String.valueOf(a.getCategoryId()) : "Sin categoria";
            byCategory.merge(cat, 1L, Long::sum);
            String cond = a.getConditionStatus() != null ? a.getConditionStatus() : "Sin definir";
            byCondition.merge(cond, 1L, Long::sum);
        });
        stats.put("byCategory", byCategory);
        stats.put("byCondition", byCondition);
        return stats;
    }

    public List<Asset> findByStatus(Long institutionId, String status) {
        return assetRepository.findByInstitutionIdAndStatusOrderByCodeAsc(institutionId, status);
    }

    public List<Asset> findByCategory(Long institutionId, Long categoryId) {
        return assetRepository.findByInstitutionIdAndCategoryIdOrderByCodeAsc(institutionId, categoryId);
    }

    public List<Asset> searchByName(Long institutionId, String name) {
        return assetRepository.findByInstitutionIdAndNameContainingIgnoreCaseOrderByCodeAsc(institutionId, name);
    }

    public Map<String, Object> getDepreciationReport(Long institutionId) {
        List<Asset> assets = assetRepository.findByInstitutionIdOrderByCodeAsc(institutionId);
        java.util.Map<String, Object> report = new java.util.HashMap<>();
        java.math.BigDecimal totalOriginal = java.math.BigDecimal.ZERO;
        java.math.BigDecimal totalCurrent = java.math.BigDecimal.ZERO;
        java.util.List<java.util.Map<String, Object>> items = new java.util.ArrayList<>();
        for (Asset a : assets) {
            java.math.BigDecimal current = a.getCurrentValue() != null ? a.getCurrentValue() : java.math.BigDecimal.ZERO;
            java.math.BigDecimal acquisition = a.getPurchaseCost() != null ? a.getPurchaseCost() : current;
            totalOriginal = totalOriginal.add(acquisition);
            totalCurrent = totalCurrent.add(current);
            java.math.BigDecimal depreciation = acquisition.subtract(current);
            java.util.Map<String, Object> item = new java.util.HashMap<>();
            item.put("id", a.getId());
            item.put("code", a.getCode());
            item.put("name", a.getName());
            item.put("acquisitionValue", acquisition);
            item.put("currentValue", current);
            item.put("depreciation", depreciation);
            item.put("depreciationPct", acquisition.compareTo(java.math.BigDecimal.ZERO) > 0
                ? depreciation.multiply(new java.math.BigDecimal("100")).divide(acquisition, 1, java.math.RoundingMode.HALF_UP) : java.math.BigDecimal.ZERO);
            items.add(item);
        }
        report.put("items", items);
        report.put("totalAcquisition", totalOriginal);
        report.put("totalCurrent", totalCurrent);
        report.put("totalDepreciation", totalOriginal.subtract(totalCurrent));
        report.put("depreciationPct", totalOriginal.compareTo(java.math.BigDecimal.ZERO) > 0
            ? totalOriginal.subtract(totalCurrent).multiply(new java.math.BigDecimal("100")).divide(totalOriginal, 1, java.math.RoundingMode.HALF_UP) : java.math.BigDecimal.ZERO);
        return report;
    }
}
