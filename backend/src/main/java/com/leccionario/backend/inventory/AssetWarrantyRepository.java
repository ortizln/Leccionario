package com.leccionario.backend.inventory;

import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;

public interface AssetWarrantyRepository extends JpaRepository<AssetWarranty, Long> {
    List<AssetWarranty> findByAssetId(Long assetId);
    List<AssetWarranty> findByInstitutionIdAndStatusOrderByEndDateAsc(Long institutionId, String status);
    List<AssetWarranty> findByEndDateBeforeAndStatus(LocalDate date, String status);
}
