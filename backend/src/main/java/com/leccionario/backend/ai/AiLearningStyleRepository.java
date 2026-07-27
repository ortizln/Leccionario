package com.leccionario.backend.ai;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface AiLearningStyleRepository extends JpaRepository<AiLearningStyle, Long> {
    Optional<AiLearningStyle> findByStudentIdAndInstitutionId(Long studentId, Long institutionId);
    List<AiLearningStyle> findByInstitutionIdAndDominantStyle(Long institutionId, String style);
}
