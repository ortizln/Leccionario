package com.leccionario.backend.inventory;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AssetCategoryRepository extends JpaRepository<AssetCategory, Long> {
    List<AssetCategory> findByInstitutionIdAndActiveTrueOrderByNameAsc(Long institutionId);
    List<AssetCategory> findByInstitutionIdOrderByNameAsc(Long institutionId);
}
