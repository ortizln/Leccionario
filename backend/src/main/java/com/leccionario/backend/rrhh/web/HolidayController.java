package com.leccionario.backend.rrhh.web;

import com.leccionario.backend.rrhh.Holiday;
import com.leccionario.backend.rrhh.HolidayService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/hr/holidays")
@CrossOrigin(origins = "*")
public class HolidayController {

    private final HolidayService holidayService;

    public HolidayController(HolidayService holidayService) {
        this.holidayService = holidayService;
    }

    @GetMapping
    public ResponseEntity<List<Holiday>> findAll(@RequestParam Long institutionId) {
        return ResponseEntity.ok(holidayService.findAll(institutionId));
    }

    @GetMapping("/active")
    public ResponseEntity<List<Holiday>> findActive(@RequestParam Long institutionId) {
        return ResponseEntity.ok(holidayService.findActive(institutionId));
    }

    @GetMapping("/range")
    public ResponseEntity<List<Holiday>> findInRange(@RequestParam Long institutionId,
                                                     @RequestParam String start, @RequestParam String end) {
        return ResponseEntity.ok(holidayService.findInRange(institutionId, LocalDate.parse(start), LocalDate.parse(end)));
    }

    @PostMapping
    public ResponseEntity<Holiday> create(@RequestBody Holiday holiday) {
        return ResponseEntity.ok(holidayService.create(holiday));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Holiday> update(@PathVariable Long id, @RequestBody Holiday holiday) {
        return ResponseEntity.ok(holidayService.update(id, holiday));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        holidayService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/check")
    public ResponseEntity<Map<String, Boolean>> checkHoliday(@RequestParam Long institutionId, @RequestParam String date) {
        return ResponseEntity.ok(Map.of("isHoliday", holidayService.isHoliday(institutionId, LocalDate.parse(date))));
    }
}
