package com.leccionario.backend.inventory;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SupplierRepository extends JpaRepository<Supplier, Long> {
    List<Supplier> findByInstitutionIdAndStatusOrderByCreatedAtDesc(Long institutionId, String status);
    List<Supplier> findByInstitutionIdOrderByCreatedAtDesc(Long institutionId);
}
