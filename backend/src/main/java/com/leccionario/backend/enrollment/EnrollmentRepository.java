package com.leccionario.backend.enrollment;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;

public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {

    List<Enrollment> findByPeriodIdOrderByEnrollmentNumberDesc(Long periodId);

    Page<Enrollment> findByPeriodId(Long periodId, Pageable pageable);

    List<Enrollment> findByStudentIdOrderByEnrollmentDateDesc(Long studentId);

    List<Enrollment> findByCourseIdAndPeriodIdOrderByEnrollmentNumber(Long courseId, Long periodId);

    Optional<Enrollment> findByStudentIdAndPeriodId(Long studentId, Long periodId);

    Optional<Enrollment> findByEnrollmentNumber(String enrollmentNumber);

    @Query("SELECT COUNT(e) FROM Enrollment e WHERE e.periodId = ?1 AND e.status = 'ACTIVE'")
    long countActiveByPeriod(Long periodId);

    @Query("SELECT COUNT(e) FROM Enrollment e WHERE e.courseId = ?1 AND e.periodId = ?2 AND e.status = 'ACTIVE'")
    long countActiveByCourseAndPeriod(Long courseId, Long periodId);

    @Query("SELECT e FROM Enrollment e WHERE e.courseId = ?1 AND e.periodId = ?2 AND e.status = 'ACTIVE' ORDER BY e.enrollmentNumber")
    List<Enrollment> findActiveByCourseAndPeriod(Long courseId, Long periodId);
}
