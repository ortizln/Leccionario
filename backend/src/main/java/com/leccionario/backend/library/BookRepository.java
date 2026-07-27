package com.leccionario.backend.library;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Map;

public interface BookRepository extends JpaRepository<Book, Long> {
    List<Book> findByInstitutionIdAndStatusOrderByTitleAsc(Long institutionId, String status);
    List<Book> findByInstitutionIdOrderByTitleAsc(Long institutionId);
    List<Book> findByTitleContainingIgnoreCaseOrAuthorContainingIgnoreCase(String title, String author);
    List<Book> findByInstitutionIdAndTitleContainingIgnoreCaseOrderByTitleAsc(Long institutionId, String title);

    @Query("SELECT b.categoryId as categoryId, COUNT(b) as bookCount FROM Book b WHERE b.institutionId = :institutionId GROUP BY b.categoryId")
    List<Map<String, Object>> countByCategory(@Param("institutionId") Long institutionId);
}
