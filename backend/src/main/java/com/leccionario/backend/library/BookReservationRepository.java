package com.leccionario.backend.library;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BookReservationRepository extends JpaRepository<BookReservation, Long> {
    List<BookReservation> findByBookIdOrderByCreatedAtDesc(Long bookId);
    List<BookReservation> findByStudentIdOrderByReservationDateDesc(Long studentId);
    List<BookReservation> findByStatus(String status);
}
