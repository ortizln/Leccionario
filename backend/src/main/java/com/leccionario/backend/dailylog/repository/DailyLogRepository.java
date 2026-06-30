package com.leccionario.backend.dailylog.repository;

import com.leccionario.backend.dailylog.domain.DailyLog;
import java.time.LocalDate;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface DailyLogRepository extends JpaRepository<DailyLog, Long> {
    Optional<DailyLog> findByCourseIdAndLogDate(Long courseId, LocalDate logDate);

    Optional<DailyLog> findByCloseToken(String closeToken);

    java.util.List<DailyLog> findDistinctByLogDateAndEntries_Teacher_User_Id(LocalDate logDate, Long userId);

    @Modifying
    @Query("DELETE FROM DailyLog dl WHERE dl.course.id = :courseId")
    void deleteByCourseId(@Param("courseId") Long courseId);
}
