package com.leccionario.backend.inventory;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, Long> {
    List<PurchaseOrder> findByInstitutionIdOrderByCreatedAtDesc(Long institutionId);
    List<PurchaseOrder> findByInstitutionIdAndStatusOrderByCreatedAtDesc(Long institutionId, String status);
}
