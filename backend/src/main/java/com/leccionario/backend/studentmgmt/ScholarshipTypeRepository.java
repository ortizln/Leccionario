package com.leccionario.backend.studentmgmt;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ScholarshipTypeRepository extends JpaRepository<ScholarshipType, Long> {
    List<ScholarshipType> findByInstitutionIdAndActiveTrueOrderByName(Long institutionId);
}
