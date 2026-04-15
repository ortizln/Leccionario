package com.leccionario.backend.academic.repository;

import com.leccionario.backend.academic.domain.AcademicPeriod;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AcademicPeriodRepository extends JpaRepository<AcademicPeriod, Long> {

    Optional<AcademicPeriod> findByActiveTrue();

    Optional<AcademicPeriod> findByNameIgnoreCase(String name);
}
