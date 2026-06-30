package com.leccionario.backend.dailylog.repository;

import com.leccionario.backend.dailylog.domain.DailyLogEntry;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface DailyLogEntryRepository extends JpaRepository<DailyLogEntry, Long> {
    Optional<DailyLogEntry> findByIdAndDailyLogId(Long id, Long dailyLogId);

    Optional<DailyLogEntry> findByCloseToken(String closeToken);

    @Modifying
    @Query("DELETE FROM DailyLogEntry e WHERE e.dailyLog.course.id = :courseId")
    void deleteByCourseId(@Param("courseId") Long courseId);

    @Modifying
    @Query("UPDATE DailyLogEntry e SET e.teacher = NULL WHERE e.teacher.id = :teacherId")
    void nullifyTeacher(@Param("teacherId") Long teacherId);
}
