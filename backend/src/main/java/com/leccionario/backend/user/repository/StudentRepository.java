package com.leccionario.backend.user.repository;

import com.leccionario.backend.user.domain.Student;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StudentRepository extends JpaRepository<Student, Long> {

    @EntityGraph(attributePaths = {"user", "course"})
    Optional<Student> findByUserId(Long userId);

    @EntityGraph(attributePaths = {"user"})
    List<Student> findByCourseIdOrderByEnrollmentNumberAsc(Long courseId);

    boolean existsByEnrollmentNumberIgnoreCaseAndCourseId(String enrollmentNumber, Long courseId);

    boolean existsByEnrollmentNumberIgnoreCaseAndCourseIdAndIdNot(String enrollmentNumber, Long courseId, Long id);

    long countByCourseId(Long courseId);

    @EntityGraph(attributePaths = {"user"})
    List<Student> findByCourseId(Long courseId);
}
