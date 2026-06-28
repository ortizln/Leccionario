package com.leccionario.backend.demerit.repository;

import com.leccionario.backend.demerit.domain.DemeritCategory;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DemeritCategoryRepository extends JpaRepository<DemeritCategory, Long> {
    Optional<DemeritCategory> findByCodeIgnoreCase(String code);
}
