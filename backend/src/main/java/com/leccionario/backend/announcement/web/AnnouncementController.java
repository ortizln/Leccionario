package com.leccionario.backend.announcement.web;

import com.leccionario.backend.announcement.dto.AnnouncementRequest;
import com.leccionario.backend.announcement.dto.AnnouncementResponse;
import com.leccionario.backend.announcement.service.AnnouncementService;
import com.leccionario.backend.schedule.dto.ScheduleBlockResponse;
import com.leccionario.backend.schedule.domain.ScheduleBlock;
import jakarta.validation.Valid;
import java.security.Principal;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/announcements")
public class AnnouncementController {

    private final AnnouncementService announcementService;

    public AnnouncementController(AnnouncementService announcementService) {
        this.announcementService = announcementService;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('ANNOUNCEMENT_MANAGE')")
    public ResponseEntity<List<AnnouncementResponse>> listAll() {
        return ResponseEntity.ok(announcementService.listAll());
    }

    @GetMapping("/my")
    public ResponseEntity<List<AnnouncementResponse>> listMy(Principal principal) {
        return ResponseEntity.ok(announcementService.listMyAnnouncements(principal.getName()));
    }

    @GetMapping("/calendar")
    public ResponseEntity<List<AnnouncementResponse>> calendar(
            @RequestParam int month, @RequestParam int year) {
        return ResponseEntity.ok(announcementService.listCalendar(month, year));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Long> unreadCount(Principal principal) {
        return ResponseEntity.ok(announcementService.getUnreadCount(principal.getName()));
    }

    @GetMapping("/schedule-blocks")
    @PreAuthorize("hasAuthority('ANNOUNCEMENT_MANAGE')")
    public ResponseEntity<List<ScheduleBlockResponse>> scheduleBlocks() {
        List<ScheduleBlockResponse> blocks = announcementService.listScheduleBlocks().stream()
                .map(b -> new ScheduleBlockResponse(
                        b.getId(),
                        b.getLabel(),
                        b.getStartTime(),
                        b.getEndTime(),
                        b.getBlockOrder(),
                        b.getBlockType(),
                        b.isActive()))
                .toList();
        return ResponseEntity.ok(blocks);
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ANNOUNCEMENT_MANAGE')")
    public ResponseEntity<AnnouncementResponse> create(
            @Valid @RequestBody AnnouncementRequest request, Principal principal) {
        return ResponseEntity.ok(announcementService.createAnnouncement(request, principal.getName()));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ANNOUNCEMENT_MANAGE')")
    public ResponseEntity<AnnouncementResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody AnnouncementRequest request,
            Principal principal) {
        return ResponseEntity.ok(announcementService.updateAnnouncement(id, request, principal.getName()));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ANNOUNCEMENT_MANAGE')")
    public ResponseEntity<Void> delete(@PathVariable Long id, Principal principal) {
        announcementService.deleteAnnouncement(id, principal.getName());
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id, Principal principal) {
        announcementService.markAsRead(id, principal.getName());
        return ResponseEntity.noContent().build();
    }
}
