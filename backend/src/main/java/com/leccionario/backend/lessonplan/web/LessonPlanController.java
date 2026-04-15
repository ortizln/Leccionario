package com.leccionario.backend.lessonplan.web;

import com.leccionario.backend.lessonplan.dto.LessonPlanRequest;
import com.leccionario.backend.lessonplan.dto.LessonPlanResponse;
import com.leccionario.backend.lessonplan.service.LessonPlanService;
import jakarta.validation.Valid;
import java.security.Principal;
import java.time.LocalDate;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/lesson-plans")
@RequiredArgsConstructor
public class LessonPlanController {

    private final LessonPlanService lessonPlanService;

    @PostMapping
    @PreAuthorize("hasAuthority('LESSONPLAN_MANAGE')")
    public ResponseEntity<LessonPlanResponse> create(@Valid @RequestBody LessonPlanRequest request, Principal principal) {
        return ResponseEntity.ok(lessonPlanService.create(request, principal.getName()));
    }

    @GetMapping
    @PreAuthorize("hasAuthority('LESSONPLAN_VIEW')")
    public ResponseEntity<List<LessonPlanResponse>> getByDates(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(lessonPlanService.findByDateRange(startDate, endDate));
    }
}
