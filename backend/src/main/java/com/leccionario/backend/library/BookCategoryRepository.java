package com.leccionario.backend.library;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BookCategoryRepository extends JpaRepository<BookCategory, Long> {
    List<BookCategory> findByInstitutionIdOrderByNameAsc(Long institutionId);
}
