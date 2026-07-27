package com.leccionario.backend.inventory;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AssetAssignmentRepository extends JpaRepository<AssetAssignment, Long> {
    List<AssetAssignment> findByAssetIdOrderByCreatedAtDesc(Long assetId);
    List<AssetAssignment> findByStatus(String status);
    List<AssetAssignment> findAllByOrderByCreatedAtDesc();
    long countByStatus(String status);
}
