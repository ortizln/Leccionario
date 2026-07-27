package com.leccionario.backend.adaptation;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CurricularAdaptationRepository extends JpaRepository<CurricularAdaptation, Long> {

    List<CurricularAdaptation> findAllByOrderByCreatedAtDesc();

    List<CurricularAdaptation> findByStudentIdOrderByCreatedAtDesc(Long studentId);

    List<CurricularAdaptation> findBySpecialNeedsId(Long specialNeedsId);

    List<CurricularAdaptation> findBySubjectIdAndStatus(Long subjectId, String status);
}
