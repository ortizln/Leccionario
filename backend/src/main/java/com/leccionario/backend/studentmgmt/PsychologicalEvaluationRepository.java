package com.leccionario.backend.studentmgmt;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PsychologicalEvaluationRepository extends JpaRepository<PsychologicalEvaluation, Long> {
    List<PsychologicalEvaluation> findByStudentIdOrderByEvaluationDateDesc(Long studentId);
    List<PsychologicalEvaluation> findByRiskLevelAndStatus(String riskLevel, String status);
    long countByRiskLevel(String riskLevel);
}
