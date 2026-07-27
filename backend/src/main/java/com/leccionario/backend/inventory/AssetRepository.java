package com.leccionario.backend.inventory;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AssetRepository extends JpaRepository<Asset, Long> {
    List<Asset> findByInstitutionIdOrderByCodeAsc(Long institutionId);
    List<Asset> findByInstitutionIdAndStatusOrderByCodeAsc(Long institutionId, String status);
    List<Asset> findByCategoryId(Long categoryId);
    List<Asset> findByInstitutionIdAndCategoryIdOrderByCodeAsc(Long institutionId, Long categoryId);
    List<Asset> findByInstitutionIdAndNameContainingIgnoreCaseOrderByCodeAsc(Long institutionId, String name);
}
