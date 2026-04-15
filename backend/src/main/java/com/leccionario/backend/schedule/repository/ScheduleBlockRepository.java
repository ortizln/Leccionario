package com.leccionario.backend.schedule.repository;

import com.leccionario.backend.schedule.domain.ScheduleBlock;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ScheduleBlockRepository extends JpaRepository<ScheduleBlock, Long> {
    Optional<ScheduleBlock> findByLabel(String label);
}
