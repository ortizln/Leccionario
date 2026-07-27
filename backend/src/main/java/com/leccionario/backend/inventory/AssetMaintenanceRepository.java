package com.leccionario.backend.inventory;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AssetMaintenanceRepository extends JpaRepository<AssetMaintenance, Long> {
    List<AssetMaintenance> findByAssetIdOrderByScheduledDateDesc(Long assetId);
    List<AssetMaintenance> findByStatusOrderByScheduledDateAsc(String status);
}
