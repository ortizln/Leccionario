package com.leccionario.backend.rrhh;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface EmployeeEvaluationRepository extends JpaRepository<EmployeeEvaluation, Long> {
    List<EmployeeEvaluation> findByEmployeeIdOrderByEvaluationDateDesc(Long employeeId);
    List<EmployeeEvaluation> findByInstitutionIdOrderByEvaluationDateDesc(Long institutionId);
    List<EmployeeEvaluation> findByInstitutionIdAndEvaluationTypeOrderByEvaluationDateDesc(Long institutionId, String type);
}
