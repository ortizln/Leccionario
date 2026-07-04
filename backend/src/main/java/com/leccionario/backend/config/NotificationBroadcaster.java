package com.leccionario.backend.config;

import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationBroadcaster {

    private final SimpMessagingTemplate messagingTemplate;

    public void broadcastAnnouncement(String eventType, Map<String, Object> payload) {
        Map<String, Object> message = Map.of(
                "type", "ANNOUNCEMENT",
                "event", eventType,
                "data", payload
        );
        messagingTemplate.convertAndSend("/topic/notifications", message);
        log.debug("Broadcast announcement event: {}", eventType);
    }

    public void broadcastAnnouncementRead(String username, Long announcementId, long unreadCount) {
        Map<String, Object> message = Map.of(
                "type", "ANNOUNCEMENT",
                "event", "READ",
                "data", Map.of(
                        "announcementId", announcementId,
                        "unreadCount", unreadCount
                )
        );
        messagingTemplate.convertAndSendToUser(username, "/queue/personal", message);
        log.debug("Broadcast read status to user {}: announcement {} marked as read", username, announcementId);
    }

    public void broadcastScheduleChange(Map<String, Object> payload) {
        Map<String, Object> message = Map.of(
                "type", "SCHEDULE",
                "event", "CHANGED",
                "data", payload
        );
        messagingTemplate.convertAndSend("/topic/notifications", message);
        log.debug("Broadcast schedule change");
    }

    public void broadcastDailyLogUpdate(Map<String, Object> payload) {
        Map<String, Object> message = Map.of(
                "type", "DAILY_LOG",
                "event", "UPDATED",
                "data", payload
        );
        messagingTemplate.convertAndSend("/topic/notifications", message);
        log.debug("Broadcast daily log update");
    }

    public void broadcastToUser(String username, Map<String, Object> payload) {
        Map<String, Object> message = Map.of(
                "type", "PERSONAL",
                "event", "NOTIFICATION",
                "data", payload
        );
        messagingTemplate.convertAndSendToUser(username, "/queue/personal", message);
        log.debug("Broadcast personal notification to user: {}", username);
    }
}
