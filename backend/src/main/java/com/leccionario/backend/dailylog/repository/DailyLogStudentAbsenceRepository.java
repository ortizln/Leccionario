package com.leccionario.backend.dailylog.repository;

import com.leccionario.backend.dailylog.domain.DailyLogStudentAbsence;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DailyLogStudentAbsenceRepository extends JpaRepository<DailyLogStudentAbsence, Long> {
    List<DailyLogStudentAbsence> findByDailyLogEntryId(Long dailyLogEntryId);
    void deleteByDailyLogEntryId(Long dailyLogEntryId);
}
