package com.leccionario.backend.user.repository;

import com.leccionario.backend.user.domain.Teacher;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TeacherRepository extends JpaRepository<Teacher, Long> {

    @EntityGraph(attributePaths = {"user"})
    Optional<Teacher> findByUserId(Long userId);

    @EntityGraph(attributePaths = {"user"})
    Optional<Teacher> findByUser_UsernameIgnoreCase(String username);

    boolean existsByUserId(Long userId);
}
