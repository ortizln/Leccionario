package com.leccionario.backend.user.repository;

import com.leccionario.backend.user.domain.Representative;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RepresentativeRepository extends JpaRepository<Representative, Long> {
    List<Representative> findByStudentId(Long studentId);
}
