package com.leccionario.backend.library;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface LibraryFineRepository extends JpaRepository<LibraryFine, Long> {
    List<LibraryFine> findByStudentIdOrderByCreatedAtDesc(Long studentId);
    List<LibraryFine> findByInstitutionIdAndStatusOrderByCreatedAtDesc(Long institutionId, String status);
    List<LibraryFine> findByInstitutionIdOrderByCreatedAtDesc(Long institutionId);
}