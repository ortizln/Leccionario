package com.leccionario.backend.studentmgmt;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ClubRepository extends JpaRepository<Club, Long> {
    List<Club> findByInstitutionIdAndActiveTrueOrderByName(Long institutionId);
    List<Club> findByInstitutionIdOrderByName(Long institutionId);
}
