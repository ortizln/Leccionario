package com.leccionario.backend.dailylog.repository;

import com.leccionario.backend.dailylog.domain.DailyLogStudentIncident;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface DailyLogStudentIncidentRepository extends JpaRepository<DailyLogStudentIncident, Long> {
    List<DailyLogStudentIncident> findByDailyLogEntryId(Long dailyLogEntryId);

    void deleteByDailyLogEntryId(Long dailyLogEntryId);

    @Modifying
    @Query("DELETE FROM DailyLogStudentIncident i WHERE i.dailyLogEntry.dailyLog.course.id = :courseId")
    void deleteByCourseId(@Param("courseId") Long courseId);

    @Modifying
    @Query("DELETE FROM DailyLogStudentIncident i WHERE i.student.id = :studentId")
    void deleteByStudentId(@Param("studentId") Long studentId);
}
