package com.leccionario.backend.inventory;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AssetCustodianRepository extends JpaRepository<AssetCustodian, Long> {
    List<AssetCustodian> findByAssetIdOrderByAssignedDateDesc(Long assetId);
    List<AssetCustodian> findByEmployeeIdAndStatusOrderByAssignedDateDesc(Long employeeId, String status);
    List<AssetCustodian> findByInstitutionIdOrderByAssignedDateDesc(Long institutionId);
}
