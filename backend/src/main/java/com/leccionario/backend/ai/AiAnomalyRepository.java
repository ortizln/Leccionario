package com.leccionario.backend.ai;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AiAnomalyRepository extends JpaRepository<AiAnomaly, Long> {
    List<AiAnomaly> findByInstitutionIdAndStatusOrderByCreatedAtDesc(Long institutionId, String status);
    List<AiAnomaly> findByInstitutionIdOrderByCreatedAtDesc(Long institutionId);
    List<AiAnomaly> findBySeverityOrderByCreatedAtDesc(String severity);
}
