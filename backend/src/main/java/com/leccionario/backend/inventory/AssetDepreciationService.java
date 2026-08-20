package com.leccionario.backend.inventory;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@Transactional
public class AssetDepreciationService {

    private final AssetRepository assetRepo;
    private final AssetWarrantyRepository warrantyRepo;

    public AssetDepreciationService(AssetRepository assetRepo, AssetWarrantyRepository warrantyRepo) {
        this.assetRepo = assetRepo;
        this.warrantyRepo = warrantyRepo;
    }

    public List<Asset> findAll(Long institutionId) {
        return assetRepo.findByInstitutionIdOrderByCodeAsc(institutionId);
    }

    public BigDecimal calculateDepreciation(Asset asset, int usefulLifeYears) {
        if (asset.getPurchaseCost() == null || asset.getPurchaseDate() == null || usefulLifeYears <= 0) {
            return BigDecimal.ZERO;
        }
        long daysUsed = ChronoUnit.DAYS.between(asset.getPurchaseDate(), LocalDate.now());
        long totalDays = (long) usefulLifeYears * 365;
        if (daysUsed >= totalDays) return asset.getPurchaseCost();
        BigDecimal depreciationPerDay = asset.getPurchaseCost()
            .divide(BigDecimal.valueOf(totalDays), 4, RoundingMode.HALF_UP);
        return depreciationPerDay.multiply(BigDecimal.valueOf(daysUsed))
            .setScale(2, RoundingMode.HALF_UP);
    }

    public BigDecimal calculateCurrentValue(Asset asset, int usefulLifeYears) {
        BigDecimal depreciation = calculateDepreciation(asset, usefulLifeYears);
        BigDecimal currentValue = asset.getPurchaseCost().subtract(depreciation);
        return currentValue.max(BigDecimal.ZERO).setScale(2, RoundingMode.HALF_UP);
    }

    public void updateAllCurrentValues(Long institutionId) {
        List<Asset> assets = assetRepo.findByInstitutionIdOrderByCodeAsc(institutionId);
        for (Asset asset : assets) {
            BigDecimal newValue = calculateCurrentValue(asset, 5);
            asset.setCurrentValue(newValue);
            assetRepo.save(asset);
        }
    }

    public List<AssetWarranty> getExpiringWarranties(Long institutionId) {
        LocalDate threeMonths = LocalDate.now().plusMonths(3);
        List<AssetWarranty> all = warrantyRepo.findByInstitutionIdAndStatusOrderByEndDateAsc(institutionId, "VIGENTE");
        return all.stream().filter(w -> w.getEndDate() != null && !w.getEndDate().isAfter(threeMonths)).toList();
    }
}
