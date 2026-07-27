package com.leccionario.backend.studentmgmt;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ScholarshipApplicationRepository extends JpaRepository<ScholarshipApplication, Long> {
    List<ScholarshipApplication> findByStudentIdOrderByApplicationDateDesc(Long studentId);
    List<ScholarshipApplication> findByStatusOrderByApplicationDateDesc(String status);
    long countByStatus(String status);
}
