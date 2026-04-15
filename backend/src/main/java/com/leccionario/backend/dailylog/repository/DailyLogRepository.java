package com.leccionario.backend.dailylog.repository;

import com.leccionario.backend.dailylog.domain.DailyLog;
import java.time.LocalDate;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DailyLogRepository extends JpaRepository<DailyLog, Long> {
    Optional<DailyLog> findByCourseIdAndLogDate(Long courseId, LocalDate logDate);

    Optional<DailyLog> findByCloseToken(String closeToken);

    java.util.List<DailyLog> findDistinctByLogDateAndEntries_Teacher_User_Id(LocalDate logDate, Long userId);
}
