package com.leccionario.backend.rrhh;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.List;

@Service
public class HolidayService {

    private final HolidayRepository holidayRepository;

    public HolidayService(HolidayRepository holidayRepository) {
        this.holidayRepository = holidayRepository;
    }

    public List<Holiday> findAll(Long institutionId) {
        return holidayRepository.findByInstitutionIdOrderByHolidayDateAsc(institutionId);
    }

    public List<Holiday> findActive(Long institutionId) {
        return holidayRepository.findByInstitutionIdAndActiveOrderByHolidayDateAsc(institutionId, true);
    }

    public List<Holiday> findInRange(Long institutionId, LocalDate start, LocalDate end) {
        return holidayRepository.findByInstitutionIdAndHolidayDateBetween(institutionId, start, end);
    }

    @Transactional
    public Holiday create(Holiday holiday) {
        return holidayRepository.save(holiday);
    }

    @Transactional
    public Holiday update(Long id, Holiday updated) {
        Holiday h = holidayRepository.findById(id).orElseThrow(() -> new RuntimeException("Holiday not found"));
        h.setName(updated.getName());
        h.setHolidayDate(updated.getHolidayDate());
        h.setCategory(updated.getCategory());
        h.setDescription(updated.getDescription());
        h.setActive(updated.getActive());
        return holidayRepository.save(h);
    }

    @Transactional
    public void delete(Long id) {
        holidayRepository.deleteById(id);
    }

    public boolean isHoliday(Long institutionId, LocalDate date) {
        return holidayRepository.findByInstitutionIdAndHolidayDateBetween(institutionId, date, date).stream()
                .anyMatch(Holiday::getActive);
    }
}
