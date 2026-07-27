package com.leccionario.backend.dailylog.repository;

import com.leccionario.backend.dailylog.domain.DailyLogStudentAbsence;
import java.time.LocalDate;
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

    @Query("SELECT a FROM DailyLogStudentAbsence a JOIN FETCH a.dailyLogEntry e JOIN FETCH e.dailyLog dl WHERE a.student.id = :studentId AND dl.logDate BETWEEN :startDate AND :endDate ORDER BY dl.logDate DESC")
    List<DailyLogStudentAbsence> findByStudentAndDateRange(@Param("studentId") Long studentId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT a FROM DailyLogStudentAbsence a JOIN FETCH a.dailyLogEntry e JOIN FETCH e.dailyLog dl WHERE dl.course.id = :courseId AND dl.logDate BETWEEN :startDate AND :endDate ORDER BY dl.logDate DESC")
    List<DailyLogStudentAbsence> findByCourseAndDateRange(@Param("courseId") Long courseId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT a FROM DailyLogStudentAbsence a JOIN FETCH a.dailyLogEntry e JOIN FETCH e.dailyLog dl WHERE dl.course.id = :courseId AND dl.period.id = :periodId ORDER BY dl.logDate DESC")
    List<DailyLogStudentAbsence> findByCourseAndPeriod(@Param("courseId") Long courseId, @Param("periodId") Long periodId);

    @Query("SELECT a FROM DailyLogStudentAbsence a JOIN FETCH a.dailyLogEntry e JOIN FETCH e.dailyLog dl WHERE a.student.id = :studentId AND dl.period.id = :periodId ORDER BY dl.logDate DESC")
    List<DailyLogStudentAbsence> findByStudentAndPeriod(@Param("studentId") Long studentId, @Param("periodId") Long periodId);

    @Query("SELECT COUNT(a) FROM DailyLogStudentAbsence a JOIN a.dailyLogEntry e JOIN e.dailyLog dl WHERE dl.course.id = :courseId AND dl.period.id = :periodId")
    long countByCourseAndPeriod(@Param("courseId") Long courseId, @Param("periodId") Long periodId);

    @Query("SELECT COUNT(a) FROM DailyLogStudentAbsence a JOIN a.dailyLogEntry e JOIN e.dailyLog dl WHERE a.student.id = :studentId AND dl.period.id = :periodId")
    long countByStudentAndPeriod(@Param("studentId") Long studentId, @Param("periodId") Long periodId);

    @Query("SELECT a.absenceType, COUNT(a) FROM DailyLogStudentAbsence a JOIN a.dailyLogEntry e JOIN e.dailyLog dl WHERE dl.course.id = :courseId AND dl.period.id = :periodId GROUP BY a.absenceType")
    List<Object[]> countByTypeForCourseAndPeriod(@Param("courseId") Long courseId, @Param("periodId") Long periodId);

    @Query("SELECT a.absenceType, COUNT(a) FROM DailyLogStudentAbsence a JOIN a.dailyLogEntry e JOIN e.dailyLog dl WHERE a.student.id = :studentId AND dl.period.id = :periodId GROUP BY a.absenceType")
    List<Object[]> countByTypeForStudentAndPeriod(@Param("studentId") Long studentId, @Param("periodId") Long periodId);
}
