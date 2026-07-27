package com.leccionario.backend.finance;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TuitionPlanRepository extends JpaRepository<TuitionPlan, Long> {
    List<TuitionPlan> findByInstitutionIdAndActiveTrueOrderByNameAsc(Long institutionId);
    List<TuitionPlan> findByInstitutionIdOrderByNameAsc(Long institutionId);
}
