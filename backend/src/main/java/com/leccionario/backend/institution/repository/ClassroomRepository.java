package com.leccionario.backend.institution.repository;

import com.leccionario.backend.institution.domain.Classroom;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ClassroomRepository extends JpaRepository<Classroom, Long> {
    List<Classroom> findByInstitutionIdAndActiveTrueOrderByName(Long institutionId);
    List<Classroom> findByCampusIdAndActiveTrueOrderByName(Long campusId);
    List<Classroom> findByClassroomTypeAndActiveTrue(String classroomType);
    long countByInstitutionIdAndActiveTrue(Long institutionId);
}
