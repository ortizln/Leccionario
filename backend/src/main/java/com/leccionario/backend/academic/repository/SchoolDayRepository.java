package com.leccionario.backend.academic.repository;

import com.leccionario.backend.academic.domain.SchoolDay;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SchoolDayRepository extends JpaRepository<SchoolDay, Long> {
    Optional<SchoolDay> findByNameIgnoreCase(String name);
}
