package com.leccionario.backend.demerit.repository;

import com.leccionario.backend.demerit.domain.Demerit;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DemeritRepository extends JpaRepository<Demerit, Long> {

    Optional<Demerit> findByCodeIgnoreCase(String code);
}
