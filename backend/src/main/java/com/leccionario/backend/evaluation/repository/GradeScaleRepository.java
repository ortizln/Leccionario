package com.leccionario.backend.evaluation.repository;

import com.leccionario.backend.evaluation.domain.GradeScale;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GradeScaleRepository extends JpaRepository<GradeScale, Long> {
    List<GradeScale> findByInstitutionIdAndActiveTrue(Long institutionId);
    Optional<GradeScale> findByInstitutionIdAndIsDefaultTrue(Long institutionId);
}
