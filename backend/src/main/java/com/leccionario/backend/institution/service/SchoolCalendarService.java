package com.leccionario.backend.institution.service;

import com.leccionario.backend.institution.domain.SchoolCalendarEvent;
import com.leccionario.backend.institution.repository.SchoolCalendarEventRepository;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.List;

@Service
public class SchoolCalendarService {

    private final SchoolCalendarEventRepository calendarRepository;

    public SchoolCalendarService(SchoolCalendarEventRepository calendarRepository) {
        this.calendarRepository = calendarRepository;
    }

    public SchoolCalendarEvent create(SchoolCalendarEvent event) {
        return calendarRepository.save(event);
    }

    public SchoolCalendarEvent update(Long id, SchoolCalendarEvent updates) {
        SchoolCalendarEvent existing = calendarRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Evento no encontrado"));
        existing.setEventName(updates.getEventName());
        existing.setEventType(updates.getEventType());
        existing.setStartDate(updates.getStartDate());
        existing.setEndDate(updates.getEndDate());
        existing.setDescription(updates.getDescription());
        existing.setIsRecurrent(updates.getIsRecurrent());
        existing.setRecurrenceRule(updates.getRecurrenceRule());
        existing.setColor(updates.getColor());
        existing.setActive(updates.getActive());
        return calendarRepository.save(existing);
    }

    public void delete(Long id) {
        calendarRepository.deleteById(id);
    }

    public SchoolCalendarEvent findById(Long id) {
        return calendarRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Evento no encontrado"));
    }

    public List<SchoolCalendarEvent> findByInstitution(Long institutionId) {
        return calendarRepository.findByInstitutionIdAndActiveTrueOrderByStartDate(institutionId);
    }

    public List<SchoolCalendarEvent> findByYear(Long institutionId, Long academicYearId) {
        return calendarRepository.findByInstitutionIdAndAcademicYearIdAndActiveTrueOrderByStartDate(institutionId, academicYearId);
    }

    public List<SchoolCalendarEvent> findByDateRange(Long institutionId, LocalDate start, LocalDate end) {
        return calendarRepository.findByInstitutionIdAndStartDateBetweenAndActiveTrue(institutionId, start, end);
    }

    public List<SchoolCalendarEvent> findByType(Long institutionId, String eventType) {
        return calendarRepository.findByInstitutionIdAndEventTypeAndActiveTrue(institutionId, eventType);
    }
}
