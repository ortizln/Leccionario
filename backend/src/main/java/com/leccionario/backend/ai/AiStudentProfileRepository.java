package com.leccionario.backend.ai;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface AiStudentProfileRepository extends JpaRepository<AiStudentProfile, Long> {
    Optional<AiStudentProfile> findByStudentIdAndInstitutionId(Long studentId, Long institutionId);
    List<AiStudentProfile> findByInstitutionIdOrderByAcademicRiskDesc(Long institutionId);
}
