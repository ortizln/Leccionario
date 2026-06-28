package com.leccionario.backend.demerit.repository;

import com.leccionario.backend.demerit.domain.DemeritFalta;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DemeritFaltaRepository extends JpaRepository<DemeritFalta, Long> {
    List<DemeritFalta> findByCategoryIdAndActiveTrue(Long categoryId);
    List<DemeritFalta> findByActiveTrue();
    Optional<DemeritFalta> findByCategoryIdAndCodeIgnoreCase(Long categoryId, String code);
}
