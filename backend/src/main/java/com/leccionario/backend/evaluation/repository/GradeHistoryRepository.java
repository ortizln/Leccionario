package com.leccionario.backend.evaluation.repository;

import com.leccionario.backend.evaluation.domain.GradeHistory;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GradeHistoryRepository extends JpaRepository<GradeHistory, Long> {
    List<GradeHistory> findByGradeIdOrderByChangedAtDesc(Long gradeId);
}
