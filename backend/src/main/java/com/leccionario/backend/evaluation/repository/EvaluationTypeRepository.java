package com.leccionario.backend.evaluation.repository;

import com.leccionario.backend.evaluation.domain.EvaluationType;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EvaluationTypeRepository extends JpaRepository<EvaluationType, Long> {
    List<EvaluationType> findByInstitutionIdAndActiveTrue(Long institutionId);
    Optional<EvaluationType> findByInstitutionIdAndCode(Long institutionId, String code);
}
