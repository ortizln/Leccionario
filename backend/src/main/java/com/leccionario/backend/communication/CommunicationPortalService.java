package com.leccionario.backend.communication;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class CommunicationPortalService {

    private final NotificationRepository notificationRepo;
    private final CommunicationGroupRepository groupRepo;
    private final MessageRecipientRepository messageRecipientRepo;
    private final CircularRepository circularRepo;
    private final SchoolEventRepository eventRepo;

    public CommunicationPortalService(NotificationRepository notificationRepo,
                                       CommunicationGroupRepository groupRepo,
                                       MessageRecipientRepository messageRecipientRepo,
                                       CircularRepository circularRepo,
                                       SchoolEventRepository eventRepo) {
        this.notificationRepo = notificationRepo;
        this.groupRepo = groupRepo;
        this.messageRecipientRepo = messageRecipientRepo;
        this.circularRepo = circularRepo;
        this.eventRepo = eventRepo;
    }

    public Map<String, Object> getPortalSummary(Long institutionId) {
        Map<String, Object> portal = new LinkedHashMap<>();

        long unread = notificationRepo.findByInstitutionIdOrderBySentAtDesc(institutionId).stream()
            .filter(n -> !Boolean.TRUE.equals(n.getReadStatus()))
            .count();
        portal.put("unreadNotifications", unread);

        List<Map<String, Object>> recentNotifs = notificationRepo.findByInstitutionIdOrderBySentAtDesc(institutionId).stream()
            .limit(5)
            .map(n -> {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("id", n.getId());
                m.put("title", n.getTitle());
                m.put("message", n.getMessage());
                m.put("read", n.getReadStatus());
                m.put("channel", n.getChannel());
                m.put("sentAt", n.getSentAt());
                return m;
            }).collect(Collectors.toList());
        portal.put("recentNotifications", recentNotifs);

        long activeGroups = groupRepo.findByInstitutionIdOrderByNameAsc(institutionId).stream()
            .count();
        portal.put("activeGroups", activeGroups);

        List<Map<String, Object>> upcoming = eventRepo.findByInstitutionIdOrderByEventDateDesc(institutionId).stream()
            .filter(e -> e.getEventDate() != null && e.getEventDate().isAfter(java.time.LocalDateTime.now()))
            .sorted(Comparator.comparing(e -> e.getEventDate()))
            .limit(5)
            .map(e -> {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("id", e.getId());
                m.put("title", e.getTitle());
                m.put("eventDate", e.getEventDate());
                m.put("eventType", e.getEventType());
                m.put("location", e.getLocation());
                return m;
            }).collect(Collectors.toList());
        portal.put("upcomingEvents", upcoming);

        long totalCirculars = circularRepo.findByInstitutionIdOrderByPublishDateDesc(institutionId).stream()
            .count();
        portal.put("totalCirculars", totalCirculars);

        return portal;
    }
}
