package com.leccionario.backend.demerit.repository;

import com.leccionario.backend.demerit.domain.DemeritStatusHistory;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DemeritStatusHistoryRepository extends JpaRepository<DemeritStatusHistory, Long> {
    List<DemeritStatusHistory> findByStudentDemerIdOrderByChangedAtDesc(Long studentDemerId);
}
