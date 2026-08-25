package com.leccionario.backend.communication;

import com.leccionario.backend.user.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/communication")
public class CommunicationController {

    private final CommunicationService communicationService;
    private final CommunicationPortalService portalService;
    private final UserRepository userRepository;

    public CommunicationController(CommunicationService communicationService, CommunicationPortalService portalService, UserRepository userRepository) {
        this.communicationService = communicationService;
        this.portalService = portalService;
        this.userRepository = userRepository;
    }

    private Long resolveUserId(Principal principal) {
        return userRepository.findByUsername(principal.getName())
                .map(u -> u.getId())
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado: " + principal.getName()));
    }

    @GetMapping("/portal")
    public ResponseEntity<Map<String, Object>> getPortalSummary(@RequestParam Long institutionId) {
        return ResponseEntity.ok(portalService.getPortalSummary(institutionId));
    }

    @GetMapping("/notifications")
    public ResponseEntity<List<Notification>> getUserNotifications(Principal principal) {
        return ResponseEntity.ok(communicationService.getUserNotifications(resolveUserId(principal)));
    }

    @GetMapping("/notifications/unread-count")
    public ResponseEntity<Long> getUnreadCount(Principal principal) {
        return ResponseEntity.ok(communicationService.getUnreadCount(resolveUserId(principal)));
    }

    @PostMapping("/notifications/{id}/read")
    public ResponseEntity<Notification> markAsRead(@PathVariable Long id) {
        return ResponseEntity.ok(communicationService.markAsRead(id));
    }

    @PostMapping("/notifications")
    public ResponseEntity<Notification> createNotification(@RequestBody Notification notif) {
        return ResponseEntity.ok(communicationService.createNotification(notif));
    }

    @GetMapping("/messages/inbox")
    public ResponseEntity<List<InternalMessage>> getInbox(Principal principal) {
        return ResponseEntity.ok(communicationService.getInbox(resolveUserId(principal)));
    }

    @GetMapping("/messages/sent")
    public ResponseEntity<List<InternalMessage>> getSent(Principal principal) {
        return ResponseEntity.ok(communicationService.getSent(resolveUserId(principal)));
    }

    @PostMapping("/messages")
    public ResponseEntity<InternalMessage> sendMessage(@RequestBody Map<String, Object> body, Principal principal) {
        InternalMessage msg = new InternalMessage();
        msg.setInstitutionId(Long.valueOf(body.get("institutionId").toString()));
        msg.setSenderId(resolveUserId(principal));
        msg.setSubject((String) body.get("subject"));
        msg.setBody((String) body.get("body"));
        msg.setPriority((String) body.getOrDefault("priority", "NORMAL"));
        @SuppressWarnings("unchecked")
        List<Long> recipients = ((List<Number>) body.get("recipientIds")).stream().map(Number::longValue).toList();
        return ResponseEntity.ok(communicationService.sendMessage(msg, recipients));
    }

    @PostMapping("/messages/{id}/read")
    public ResponseEntity<Void> markMessageRead(@PathVariable Long id, Principal principal) {
        communicationService.markMessageRead(id, resolveUserId(principal));
        return ResponseEntity.ok().build();
    }

    @GetMapping("/parent-comm/student/{studentId}")
    public ResponseEntity<List<ParentCommunication>> getStudentCommunications(@PathVariable Long studentId) {
        return ResponseEntity.ok(communicationService.getStudentCommunications(studentId));
    }

    @PostMapping("/parent-comm")
    public ResponseEntity<ParentCommunication> createParentCommunication(@RequestBody ParentCommunication pc) {
        return ResponseEntity.ok(communicationService.createParentCommunication(pc));
    }

    @PostMapping("/parent-comm/{id}/respond")
    public ResponseEntity<ParentCommunication> respondToCommunication(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(communicationService.respondToCommunication(id, body.get("response")));
    }

    @GetMapping("/groups")
    public ResponseEntity<List<CommunicationGroup>> findAllGroups(@RequestParam Long institutionId) {
        return ResponseEntity.ok(communicationService.findAllGroups(institutionId));
    }

    @PostMapping("/groups")
    public ResponseEntity<CommunicationGroup> createGroup(@RequestBody CommunicationGroup group) {
        return ResponseEntity.ok(communicationService.createGroup(group));
    }

    @PutMapping("/groups/{id}")
    public ResponseEntity<CommunicationGroup> updateGroup(@PathVariable Long id, @RequestBody CommunicationGroup group) {
        return ResponseEntity.ok(communicationService.updateGroup(id, group));
    }

    @DeleteMapping("/groups/{id}")
    public ResponseEntity<Void> deleteGroup(@PathVariable Long id) {
        communicationService.deleteGroup(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/groups/{id}/send")
    public ResponseEntity<Void> sendBulkMessage(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        String subject = (String) body.get("subject");
        String message = (String) body.get("message");
        boolean sendNotification = (boolean) body.getOrDefault("sendNotification", true);
        communicationService.sendBulkMessage(id, subject, message, sendNotification);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/groups/{id}/members")
    public ResponseEntity<Void> addMember(@PathVariable Long id, @RequestBody Map<String, Long> body) {
        communicationService.addMemberToGroup(id, body.get("userId"));
        return ResponseEntity.ok().build();
    }

    @GetMapping("/groups/{id}/members")
    public ResponseEntity<List<CommunicationGroupMember>> getGroupMembers(@PathVariable Long id) {
        return ResponseEntity.ok(communicationService.getGroupMembers(id));
    }
}
