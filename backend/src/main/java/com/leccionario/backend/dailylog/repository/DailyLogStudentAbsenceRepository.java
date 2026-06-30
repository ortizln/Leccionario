package com.leccionario.backend.dailylog.repository;

import com.leccionario.backend.dailylog.domain.DailyLogStudentAbsence;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface DailyLogStudentAbsenceRepository extends JpaRepository<DailyLogStudentAbsence, Long> {
    List<DailyLogStudentAbsence> findByDailyLogEntryId(Long dailyLogEntryId);
    void deleteByDailyLogEntryId(Long dailyLogEntryId);

    @Modifying
    @Query("DELETE FROM DailyLogStudentAbsence a WHERE a.dailyLogEntry.dailyLog.course.id = :courseId")
    void deleteByCourseId(@Param("courseId") Long courseId);

    @Modifying
    @Query("DELETE FROM DailyLogStudentAbsence a WHERE a.student.id = :studentId")
    void deleteByStudentId(@Param("studentId") Long studentId);
}
