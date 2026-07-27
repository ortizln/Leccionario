package com.leccionario.backend.ai;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AiStudyPlanRepository extends JpaRepository<AiStudyPlan, Long> {
    List<AiStudyPlan> findByStudentIdAndInstitutionIdOrderByCreatedAtDesc(Long studentId, Long institutionId);
    List<AiStudyPlan> findByInstitutionIdAndStatusOrderByCreatedAtDesc(Long institutionId, String status);
}
