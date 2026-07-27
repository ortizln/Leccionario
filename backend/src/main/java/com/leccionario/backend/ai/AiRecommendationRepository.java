package com.leccionario.backend.ai;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AiRecommendationRepository extends JpaRepository<AiRecommendation, Long> {
    List<AiRecommendation> findByInstitutionIdAndStatusOrderByCreatedAtDesc(Long institutionId, String status);
    List<AiRecommendation> findByInstitutionIdOrderByCreatedAtDesc(Long institutionId);
    List<AiRecommendation> findByTargetTypeAndTargetIdOrderByCreatedAtDesc(String targetType, Long targetId);
}
