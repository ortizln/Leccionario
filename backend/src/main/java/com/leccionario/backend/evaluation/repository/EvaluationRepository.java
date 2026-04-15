package com.leccionario.backend.evaluation.repository;

import com.leccionario.backend.evaluation.domain.Evaluation;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EvaluationRepository extends JpaRepository<Evaluation, Long> {
}
