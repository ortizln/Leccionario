package com.leccionario.backend.library;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Map;

public interface BookLoanRepository extends JpaRepository<BookLoan, Long> {
    List<BookLoan> findByBookIdOrderByCreatedAtDesc(Long bookId);
    List<BookLoan> findByStudentIdOrderByLoanDateDesc(Long studentId);
    List<BookLoan> findByStudentIdOrderByCreatedAtDesc(Long studentId);
    List<BookLoan> findByStatusOrderByDueDateAsc(String status);

    @Query("SELECT bl.bookId as bookId, COUNT(bl) as loanCount FROM BookLoan bl WHERE bl.bookId IN (SELECT b.id FROM Book b WHERE b.institutionId = :institutionId) GROUP BY bl.bookId ORDER BY COUNT(bl) DESC")
    List<Map<String, Object>> findMostLoanedBooks(@Param("institutionId") Long institutionId);
}
