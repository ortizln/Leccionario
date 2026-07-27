package com.leccionario.backend.finance;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface StudentTuitionRepository extends JpaRepository<StudentTuition, Long> {
    List<StudentTuition> findByStudentIdAndPeriodIdOrderByStatusDesc(Long studentId, Long periodId);
    List<StudentTuition> findByPeriodIdOrderByStatusDesc(Long periodId);

    @Query("SELECT st FROM StudentTuition st WHERE st.studentId = :studentId ORDER BY st.periodId DESC")
    List<StudentTuition> findByStudentIdAllPeriods(@Param("studentId") Long studentId);
}
