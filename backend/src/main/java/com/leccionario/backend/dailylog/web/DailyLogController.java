package com.leccionario.backend.dailylog.web;

import com.leccionario.backend.dailylog.dto.DailyLogAbsenceUpdateRequest;
import com.leccionario.backend.dailylog.dto.DailyLogEntryResponse;
import com.leccionario.backend.dailylog.dto.DailyLogEntryUpdateRequest;
import com.leccionario.backend.dailylog.dto.DailyLogGenerateRequest;
import com.leccionario.backend.dailylog.dto.DailyLogIncidentUpdateRequest;
import com.leccionario.backend.dailylog.dto.DailyLogResponse;
import com.leccionario.backend.dailylog.dto.MobileCloseRequest;
import com.leccionario.backend.dailylog.dto.MobileEntryCloseResponse;
import com.leccionario.backend.dailylog.dto.MobileLogCloseResponse;
import com.leccionario.backend.dailylog.dto.MobileLogSignatureResponse;
import com.leccionario.backend.dailylog.dto.MobileTodayResponse;
import com.leccionario.backend.dailylog.domain.DailyLogSignatureType;
import com.leccionario.backend.dailylog.service.DailyLogService;
import jakarta.validation.Valid;
import java.security.Principal;
import java.time.LocalDate;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/daily-logs")
@RequiredArgsConstructor
public class DailyLogController {

    private final DailyLogService dailyLogService;

    @PostMapping("/generate")
    @PreAuthorize("hasAuthority('LESSONPLAN_MANAGE')")
    public ResponseEntity<DailyLogResponse> generate(
            @Valid @RequestBody DailyLogGenerateRequest request,
            Principal principal) {
        return ResponseEntity.ok(dailyLogService.generate(request, principal.getName()));
    }

    @GetMapping
    @PreAuthorize("hasAuthority('LESSONPLAN_VIEW')")
    public ResponseEntity<DailyLogResponse> getByCourseAndDate(
            @RequestParam Long courseId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate logDate) {
        return ResponseEntity.ok(dailyLogService.findByCourseAndDate(courseId, logDate));
    }

    @GetMapping("/mobile/today")
    @PreAuthorize("hasAuthority('LESSONPLAN_VIEW')")
    public ResponseEntity<MobileTodayResponse> getMobileToday(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate workDate,
            Principal principal) {
        return ResponseEntity.ok(dailyLogService.getMobileToday(
                workDate != null ? workDate : LocalDate.now(),
                principal.getName()));
    }

    @PutMapping("/{dailyLogId}/entries/{entryId}")
    @PreAuthorize("hasAuthority('LESSONPLAN_MANAGE')")
    public ResponseEntity<DailyLogEntryResponse> updateEntry(
            @PathVariable Long dailyLogId,
            @PathVariable Long entryId,
            @RequestBody DailyLogEntryUpdateRequest request,
            Principal principal) {
        return ResponseEntity.ok(dailyLogService.updateEntry(dailyLogId, entryId, request, principal.getName()));
    }

    @PutMapping("/{dailyLogId}/entries/{entryId}/absences")
    @PreAuthorize("hasAuthority('LESSONPLAN_MANAGE')")
    public ResponseEntity<DailyLogEntryResponse> updateAbsences(
            @PathVariable Long dailyLogId,
            @PathVariable Long entryId,
            @RequestBody DailyLogAbsenceUpdateRequest request,
            Principal principal) {
        return ResponseEntity.ok(dailyLogService.updateAbsences(dailyLogId, entryId, request, principal.getName()));
    }

    @PutMapping("/{dailyLogId}/entries/{entryId}/incidents")
    @PreAuthorize("hasAuthority('LESSONPLAN_MANAGE')")
    public ResponseEntity<DailyLogEntryResponse> updateIncidents(
            @PathVariable Long dailyLogId,
            @PathVariable Long entryId,
            @RequestBody DailyLogIncidentUpdateRequest request,
            Principal principal) {
        return ResponseEntity.ok(dailyLogService.updateIncidents(dailyLogId, entryId, request, principal.getName()));
    }

    @GetMapping("/mobile/entries/{token}")
    public ResponseEntity<MobileEntryCloseResponse> getMobileEntry(@PathVariable String token) {
        return ResponseEntity.ok(dailyLogService.getMobileEntryClose(token));
    }

    @PostMapping("/mobile/entries/{token}/close")
    public ResponseEntity<MobileEntryCloseResponse> closeMobileEntry(
            @PathVariable String token,
            @Valid @RequestBody MobileCloseRequest request) {
        return ResponseEntity.ok(dailyLogService.closeEntryFromMobile(token, request));
    }

    @GetMapping("/mobile/logs/{token}")
    public ResponseEntity<MobileLogCloseResponse> getMobileLog(@PathVariable String token) {
        return ResponseEntity.ok(dailyLogService.getMobileLogClose(token));
    }

    @GetMapping("/mobile/logs/{token}/signatures/{signatureType}")
    public ResponseEntity<MobileLogSignatureResponse> getMobileLogSignature(
            @PathVariable String token,
            @PathVariable DailyLogSignatureType signatureType) {
        return ResponseEntity.ok(dailyLogService.getMobileLogSignature(token, signatureType));
    }

    @PostMapping("/mobile/logs/{token}/signatures/{signatureType}")
    public ResponseEntity<MobileLogSignatureResponse> signMobileLog(
            @PathVariable String token,
            @PathVariable DailyLogSignatureType signatureType,
            @Valid @RequestBody MobileCloseRequest request) {
        return ResponseEntity.ok(dailyLogService.signLogFromMobile(token, signatureType, request));
    }

    @PostMapping("/mobile/logs/{token}/close")
    public ResponseEntity<MobileLogCloseResponse> closeMobileLog(
            @PathVariable String token,
            @Valid @RequestBody MobileCloseRequest request) {
        return ResponseEntity.ok(dailyLogService.closeLogFromMobile(token, request));
    }
}
