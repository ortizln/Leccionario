package com.leccionario.backend.rrhh;

import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;

public interface HolidayRepository extends JpaRepository<Holiday, Long> {
    List<Holiday> findByInstitutionIdOrderByHolidayDateAsc(Long institutionId);
    List<Holiday> findByInstitutionIdAndActiveOrderByHolidayDateAsc(Long institutionId, Boolean active);
    List<Holiday> findByInstitutionIdAndHolidayDateBetween(Long institutionId, LocalDate start, LocalDate end);
}
