package com.leccionario.backend.academic.repository;

import com.leccionario.backend.academic.domain.Course;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CourseRepository extends JpaRepository<Course, Long> {
    Optional<Course> findByNameIgnoreCaseAndParallelIgnoreCase(String name, String parallel);
}
