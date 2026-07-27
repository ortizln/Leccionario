package com.leccionario.backend.institution.repository;

import com.leccionario.backend.institution.domain.Shift;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ShiftRepository extends JpaRepository<Shift, Long> {
    List<Shift> findByInstitutionIdAndActiveTrueOrderByName(Long institutionId);
    List<Shift> findByInstitutionIdOrderByName(Long institutionId);
}
