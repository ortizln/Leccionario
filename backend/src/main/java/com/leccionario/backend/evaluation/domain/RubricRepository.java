package com.leccionario.backend.evaluation.domain;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RubricRepository extends JpaRepository<Rubric, Long> {
    List<Rubric> findByInstitutionIdOrderByCreatedAtDesc(Long institutionId);
}
