package com.leccionario.backend.institution.repository;

import com.leccionario.backend.institution.domain.Campus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CampusRepository extends JpaRepository<Campus, Long> {
    List<Campus> findByInstitutionIdAndActiveTrueOrderByName(Long institutionId);
    List<Campus> findByInstitutionIdOrderByName(Long institutionId);
}
