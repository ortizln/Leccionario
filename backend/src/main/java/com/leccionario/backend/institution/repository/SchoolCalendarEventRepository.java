package com.leccionario.backend.institution.repository;

import com.leccionario.backend.institution.domain.SchoolCalendarEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;

public interface SchoolCalendarEventRepository extends JpaRepository<SchoolCalendarEvent, Long> {
    List<SchoolCalendarEvent> findByInstitutionIdAndActiveTrueOrderByStartDate(Long institutionId);
    List<SchoolCalendarEvent> findByInstitutionIdAndAcademicYearIdAndActiveTrueOrderByStartDate(Long institutionId, Long academicYearId);
    List<SchoolCalendarEvent> findByInstitutionIdAndStartDateBetweenAndActiveTrue(Long institutionId, LocalDate start, LocalDate end);
    List<SchoolCalendarEvent> findByInstitutionIdAndEventTypeAndActiveTrue(Long institutionId, String eventType);
}
