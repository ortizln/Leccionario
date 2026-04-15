package com.leccionario.backend.institution.repository;

import com.leccionario.backend.institution.domain.Institution;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InstitutionRepository extends JpaRepository<Institution, Long> {
    Optional<Institution> findByNameIgnoreCase(String name);
    Optional<Institution> findByCodeIgnoreCase(String code);
}
