package com.leccionario.backend.academic.repository;

import com.leccionario.backend.academic.domain.Subject;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SubjectRepository extends JpaRepository<Subject, Long> {
    Optional<Subject> findByCodeIgnoreCase(String code);
}
