package com.leccionario.backend.demerit.repository;

import com.leccionario.backend.demerit.domain.DemeritEvidence;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DemeritEvidenceRepository extends JpaRepository<DemeritEvidence, Long> {
    List<DemeritEvidence> findByStudentDemerId(Long studentDemerId);
    void deleteByStudentDemerId(Long studentDemerId);
}
