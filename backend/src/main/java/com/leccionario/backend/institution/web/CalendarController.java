package com.leccionario.backend.institution.web;

import com.leccionario.backend.institution.domain.SchoolCalendarEvent;
import com.leccionario.backend.institution.service.SchoolCalendarService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;

@RestController
@RequestMapping("/api/institution/calendar")
public class CalendarController {

    private final SchoolCalendarService calendarService;

    public CalendarController(SchoolCalendarService calendarService) {
        this.calendarService = calendarService;
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody SchoolCalendarEvent event) {
        return ResponseEntity.ok(calendarService.create(event));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody SchoolCalendarEvent event) {
        return ResponseEntity.ok(calendarService.update(id, event));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        calendarService.delete(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> findById(@PathVariable Long id) {
        return ResponseEntity.ok(calendarService.findById(id));
    }

    @GetMapping("/institution/{institutionId}")
    public ResponseEntity<?> findByInstitution(@PathVariable Long institutionId) {
        return ResponseEntity.ok(calendarService.findByInstitution(institutionId));
    }

    @GetMapping("/institution/{institutionId}/year/{yearId}")
    public ResponseEntity<?> findByYear(@PathVariable Long institutionId, @PathVariable Long yearId) {
        return ResponseEntity.ok(calendarService.findByYear(institutionId, yearId));
    }

    @GetMapping("/institution/{institutionId}/range")
    public ResponseEntity<?> findByDateRange(
            @PathVariable Long institutionId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
        return ResponseEntity.ok(calendarService.findByDateRange(institutionId, start, end));
    }

    @GetMapping("/institution/{institutionId}/type/{eventType}")
    public ResponseEntity<?> findByType(@PathVariable Long institutionId, @PathVariable String eventType) {
        return ResponseEntity.ok(calendarService.findByType(institutionId, eventType));
    }
}
