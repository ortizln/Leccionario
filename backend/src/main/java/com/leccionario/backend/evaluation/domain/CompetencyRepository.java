package com.leccionario.backend.evaluation.domain;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CompetencyRepository extends JpaRepository<Competency, Long> {
    List<Competency> findByInstitutionIdAndIsActiveTrueOrderByNameAsc(Long institutionId);
    List<Competency> findByInstitutionIdAndCompetencyTypeOrderByNameAsc(Long institutionId, String competencyType);
}
