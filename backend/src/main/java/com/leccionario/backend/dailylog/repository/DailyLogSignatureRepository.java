package com.leccionario.backend.dailylog.repository;

import com.leccionario.backend.dailylog.domain.DailyLogSignature;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface DailyLogSignatureRepository extends JpaRepository<DailyLogSignature, Long> {
    List<DailyLogSignature> findByDailyLogId(Long dailyLogId);

    @Modifying
    @Query("DELETE FROM DailyLogSignature s WHERE s.dailyLog.course.id = :courseId")
    void deleteByCourseId(@Param("courseId") Long courseId);
}
