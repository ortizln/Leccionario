package com.leccionario.backend.academic.repository;

import com.leccionario.backend.academic.domain.SchoolModality;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SchoolModalityRepository extends JpaRepository<SchoolModality, Long> {
    Optional<SchoolModality> findByNameIgnoreCase(String name);
}
