package com.leccionario.backend.dailylog.repository;

import com.leccionario.backend.dailylog.domain.DailyLogEntry;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DailyLogEntryRepository extends JpaRepository<DailyLogEntry, Long> {
    Optional<DailyLogEntry> findByIdAndDailyLogId(Long id, Long dailyLogId);

    Optional<DailyLogEntry> findByCloseToken(String closeToken);
}
