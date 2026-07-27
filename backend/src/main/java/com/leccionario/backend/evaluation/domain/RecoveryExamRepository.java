package com.leccionario.backend.evaluation.domain;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RecoveryExamRepository extends JpaRepository<RecoveryExam, Long> {
    List<RecoveryExam> findByInstitutionIdOrderByScheduledDateDesc(Long institutionId);
    List<RecoveryExam> findByStudentIdOrderByScheduledDateDesc(Long studentId);
    List<RecoveryExam> findByInstitutionIdAndStatusOrderByScheduledDateAsc(Long institutionId, String status);
}
