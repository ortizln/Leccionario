package com.leccionario.backend.academic.repository;

import com.leccionario.backend.academic.domain.AcademicYear;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AcademicYearRepository extends JpaRepository<AcademicYear, Long> {
    Optional<AcademicYear> findByYear(int year);
    Optional<AcademicYear> findByActiveTrue();
}
