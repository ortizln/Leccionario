package com.leccionario.backend.communication;

import org.springframework.http.ResponseEntity;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/communication")
@Tag(name = "ComunicaciÃ³n")
public class CommunicationController {

    private final CommunicationService communicationService;
    private final CommunicationPortalService portalService;

    public CommunicationController(CommunicationService communicationService, CommunicationPortalService portalService) {
        this.communicationService = communicationService;
        this.portalService = portalService;
    }

    @Operation(summary = "Resumen del portal de comunicaciÃ³n")
    @GetMapping("/portal")
    public ResponseEntity<Map<String, Object>> getPortalSummary(@RequestParam Long institutionId) {
        return ResponseEntity.ok(portalService.getPortalSummary(institutionId));
    }

    @Operation(summary = "Obtener notificaciones del usuario")
    @GetMapping("/notifications")
    public ResponseEntity<List<Notification>> getUserNotifications(@RequestParam Long userId) {
        return ResponseEntity.ok(communicationService.getUserNotifications(userId));
    }

    @Operation(summary = "Contar notificaciones no leÃ­das")
    @GetMapping("/notifications/unread-count")
    public ResponseEntity<Long> getUnreadCount(@RequestParam Long userId) {
        return ResponseEntity.ok(communicationService.getUnreadCount(userId));
    }

    @Operation(summary = "Marcar notificaciÃ³n como leÃ­da")
    @PostMapping("/notifications/{id}/read")
    public ResponseEntity<Notification> markAsRead(@PathVariable Long id) {
        return ResponseEntity.ok(communicationService.markAsRead(id));
    }

    @Operation(summary = "Crear una nueva notificaciÃ³n")
    @PostMapping("/notifications")
    public ResponseEntity<Notification> createNotification(@RequestBody Notification notif) {
        return ResponseEntity.ok(communicationService.createNotification(notif));
    }

    @Operation(summary = "Obtener bandeja de entrada")
    @GetMapping("/messages/inbox")
    public ResponseEntity<List<InternalMessage>> getInbox(@RequestParam Long userId) {
        return ResponseEntity.ok(communicationService.getInbox(userId));
    }

    @Operation(summary = "Obtener mensajes enviados")
    @GetMapping("/messages/sent")
    public ResponseEntity<List<InternalMessage>> getSent(@RequestParam Long userId) {
        return ResponseEntity.ok(communicationService.getSent(userId));
    }

    @Operation(summary = "Enviar un mensaje interno")
    @PostMapping("/messages")
    public ResponseEntity<InternalMessage> sendMessage(@RequestBody Map<String, Object> body) {
        InternalMessage msg = new InternalMessage();
        msg.setInstitutionId(Long.valueOf(body.get("institutionId").toString()));
        msg.setSenderId(Long.valueOf(body.get("senderId").toString()));
        msg.setSubject((String) body.get("subject"));
        msg.setBody((String) body.get("body"));
        msg.setPriority((String) body.getOrDefault("priority", "NORMAL"));
        @SuppressWarnings("unchecked")
        List<Long> recipients = ((List<Number>) body.get("recipientIds")).stream().map(Number::longValue).toList();
        return ResponseEntity.ok(communicationService.sendMessage(msg, recipients));
    }

    @Operation(summary = "Marcar mensaje como leÃ­do")
    @PostMapping("/messages/{id}/read")
    public ResponseEntity<Void> markMessageRead(@PathVariable Long id, @RequestParam Long userId) {
        communicationService.markMessageRead(id, userId);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Obtener comunicaciones de un estudiante")
    @GetMapping("/parent-comm/student/{studentId}")
    public ResponseEntity<List<ParentCommunication>> getStudentCommunications(@PathVariable Long studentId) {
        return ResponseEntity.ok(communicationService.getStudentCommunications(studentId));
    }

    @Operation(summary = "Crear comunicaciÃ³n con padres")
    @PostMapping("/parent-comm")
    public ResponseEntity<ParentCommunication> createParentCommunication(@RequestBody ParentCommunication pc) {
        return ResponseEntity.ok(communicationService.createParentCommunication(pc));
    }

    @Operation(summary = "Responder a una comunicaciÃ³n con padres")
    @PostMapping("/parent-comm/{id}/respond")
    public ResponseEntity<ParentCommunication> respondToCommunication(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(communicationService.respondToCommunication(id, body.get("response")));
    }

    @Operation(summary = "Listar grupos de comunicaciÃ³n")
    @GetMapping("/groups")
    public ResponseEntity<List<CommunicationGroup>> findAllGroups(@RequestParam Long institutionId) {
        return ResponseEntity.ok(communicationService.findAllGroups(institutionId));
    }

    @Operation(summary = "Crear un grupo de comunicaciÃ³n")
    @PostMapping("/groups")
    public ResponseEntity<CommunicationGroup> createGroup(@RequestBody CommunicationGroup group) {
        return ResponseEntity.ok(communicationService.createGroup(group));
    }

    @Operation(summary = "Actualizar un grupo de comunicaciÃ³n")
    @PutMapping("/groups/{id}")
    public ResponseEntity<CommunicationGroup> updateGroup(@PathVariable Long id, @RequestBody CommunicationGroup group) {
        return ResponseEntity.ok(communicationService.updateGroup(id, group));
    }

    @Operation(summary = "Eliminar un grupo de comunicaciÃ³n")
    @DeleteMapping("/groups/{id}")
    public ResponseEntity<Void> deleteGroup(@PathVariable Long id) {
        communicationService.deleteGroup(id);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Enviar mensaje masivo a un grupo")
    @PostMapping("/groups/{id}/send")
    public ResponseEntity<Void> sendBulkMessage(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        String subject = (String) body.get("subject");
        String message = (String) body.get("message");
        boolean sendNotification = (boolean) body.getOrDefault("sendNotification", true);
        communicationService.sendBulkMessage(id, subject, message, sendNotification);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Agregar miembro a un grupo")
    @PostMapping("/groups/{id}/members")
    public ResponseEntity<Void> addMember(@PathVariable Long id, @RequestBody Map<String, Long> body) {
        communicationService.addMemberToGroup(id, body.get("userId"));
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Obtener miembros de un grupo")
    @GetMapping("/groups/{id}/members")
    public ResponseEntity<List<CommunicationGroupMember>> getGroupMembers(@PathVariable Long id) {
        return ResponseEntity.ok(communicationService.getGroupMembers(id));
    }
}