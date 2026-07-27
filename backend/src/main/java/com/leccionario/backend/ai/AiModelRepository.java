package com.leccionario.backend.ai;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AiModelRepository extends JpaRepository<AiModel, Long> {
    List<AiModel> findByInstitutionIdAndStatusOrderByNameAsc(Long institutionId, String status);
    List<AiModel> findByInstitutionIdOrderByNameAsc(Long institutionId);
}
