package com.leccionario.backend.ai;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AiPredictionRepository extends JpaRepository<AiPrediction, Long> {
    List<AiPrediction> findByStudentIdOrderByCreatedAtDesc(Long studentId);
    List<AiPrediction> findByModelIdAndStatusOrderByCreatedAtDesc(Long modelId, String status);
    List<AiPrediction> findByStudentIdAndStatusOrderByCreatedAtDesc(Long studentId, String status);
}
