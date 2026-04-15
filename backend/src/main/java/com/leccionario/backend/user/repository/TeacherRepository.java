package com.leccionario.backend.user.repository;

import com.leccionario.backend.user.domain.Teacher;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TeacherRepository extends JpaRepository<Teacher, Long> {
    Optional<Teacher> findByUserId(Long userId);

    Optional<Teacher> findByUser_UsernameIgnoreCase(String username);

    boolean existsByUserId(Long userId);
}
