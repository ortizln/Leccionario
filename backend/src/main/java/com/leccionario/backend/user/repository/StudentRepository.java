package com.leccionario.backend.user.repository;

import com.leccionario.backend.user.domain.Student;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StudentRepository extends JpaRepository<Student, Long> {
    Optional<Student> findByUserId(Long userId);

    List<Student> findByCourseIdOrderByEnrollmentNumberAsc(Long courseId);

    boolean existsByEnrollmentNumberIgnoreCaseAndCourseId(String enrollmentNumber, Long courseId);

    boolean existsByEnrollmentNumberIgnoreCaseAndCourseIdAndIdNot(String enrollmentNumber, Long courseId, Long id);

    long countByCourseId(Long courseId);
}
