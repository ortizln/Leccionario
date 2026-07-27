package com.leccionario.backend.communication;

import com.leccionario.backend.config.NotificationBroadcaster;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.Instant;
import java.util.List;
import java.util.Map;

@Service
public class CommunicationService {

    private final NotificationRepository notificationRepository;
    private final InternalMessageRepository messageRepository;
    private final MessageRecipientRepository recipientRepository;
    private final ParentCommunicationRepository parentCommRepository;
    private final CommunicationGroupRepository groupRepository;
    private final CommunicationGroupMemberRepository groupMemberRepository;
    private final NotificationBroadcaster broadcaster;

    public CommunicationService(NotificationRepository notificationRepository, InternalMessageRepository messageRepository,
                                MessageRecipientRepository recipientRepository, ParentCommunicationRepository parentCommRepository,
                                CommunicationGroupRepository groupRepository, CommunicationGroupMemberRepository groupMemberRepository,
                                NotificationBroadcaster broadcaster) {
        this.notificationRepository = notificationRepository;
        this.messageRepository = messageRepository;
        this.recipientRepository = recipientRepository;
        this.parentCommRepository = parentCommRepository;
        this.groupRepository = groupRepository;
        this.groupMemberRepository = groupMemberRepository;
        this.broadcaster = broadcaster;
    }

    public List<Notification> getUserNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderBySentAtDesc(userId);
    }

    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndReadStatus(userId, false);
    }

    @Transactional
    public Notification markAsRead(Long id) {
        Notification n = notificationRepository.findById(id).orElseThrow(() -> new RuntimeException("Notification not found"));
        n.setReadStatus(true);
        n.setReadAt(Instant.now());
        return notificationRepository.save(n);
    }

    @Transactional
    public Notification createNotification(Notification notif) {
        Notification saved = notificationRepository.save(notif);
        if (saved.getUserId() != null) {
            broadcaster.broadcastToUser(String.valueOf(saved.getUserId()), Map.of(
                "title", saved.getTitle(),
                "messageBody", saved.getMessage(),
                "type", saved.getChannel(),
                "severity", saved.getPriority(),
                "createdAt", saved.getCreatedAt().toString()
            ));
        }
        return saved;
    }

    public List<InternalMessage> getInbox(Long userId) {
        return recipientRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .filter(r -> !r.getReadStatus())
                .map(r -> messageRepository.findById(r.getMessageId()).orElse(null))
                .filter(m -> m != null)
                .toList();
    }

    public List<InternalMessage> getSent(Long userId) {
        return messageRepository.findBySenderIdOrderByCreatedAtDesc(userId);
    }

    @Transactional
    public InternalMessage sendMessage(InternalMessage msg, List<Long> recipientUserIds) {
        InternalMessage saved = messageRepository.save(msg);
        for (Long uid : recipientUserIds) {
            MessageRecipient r = new MessageRecipient();
            r.setMessageId(saved.getId());
            r.setUserId(uid);
            recipientRepository.save(r);
        }
        return saved;
    }

    @Transactional
    public void markMessageRead(Long messageId, Long userId) {
        recipientRepository.findByMessageId(messageId).stream()
                .filter(r -> r.getUserId().equals(userId))
                .findFirst()
                .ifPresent(r -> { r.setReadStatus(true); r.setReadAt(Instant.now()); recipientRepository.save(r); });
    }

    public List<ParentCommunication> getStudentCommunications(Long studentId) {
        return parentCommRepository.findByStudentIdOrderByCreatedAtDesc(studentId);
    }

    @Transactional
    public ParentCommunication createParentCommunication(ParentCommunication pc) {
        return parentCommRepository.save(pc);
    }

    @Transactional
    public ParentCommunication respondToCommunication(Long id, String response) {
        ParentCommunication pc = parentCommRepository.findById(id).orElseThrow(() -> new RuntimeException("Communication not found"));
        pc.setResponse(response);
        pc.setStatus("RESPONDIDO");
        pc.setRespondedAt(Instant.now());
        return parentCommRepository.save(pc);
    }

    public List<CommunicationGroup> findAllGroups(Long institutionId) {
        return groupRepository.findByInstitutionIdOrderByNameAsc(institutionId);
    }

    @Transactional
    public CommunicationGroup createGroup(CommunicationGroup group) {
        return groupRepository.save(group);
    }

    @Transactional
    public void addMemberToGroup(Long groupId, Long userId) {
        CommunicationGroupMember m = new CommunicationGroupMember();
        m.setGroupId(groupId);
        m.setUserId(userId);
        groupMemberRepository.save(m);
    }

    public List<CommunicationGroupMember> getGroupMembers(Long groupId) {
        return groupMemberRepository.findByGroupId(groupId);
    }

    @Transactional
    public CommunicationGroup updateGroup(Long id, CommunicationGroup updated) {
        CommunicationGroup group = groupRepository.findById(id).orElseThrow(() -> new RuntimeException("Group not found"));
        if (updated.getName() != null) group.setName(updated.getName());
        if (updated.getDescription() != null) group.setDescription(updated.getDescription());
        if (updated.getGroupType() != null) group.setGroupType(updated.getGroupType());
        return groupRepository.save(group);
    }

    @Transactional
    public void deleteGroup(Long id) {
        groupMemberRepository.findByGroupId(id).forEach(groupMemberRepository::delete);
        groupRepository.deleteById(id);
    }

    @Transactional
    public void sendBulkMessage(Long groupId, String subject, String messageBody, boolean sendNotification) {
        List<CommunicationGroupMember> members = groupMemberRepository.findByGroupId(groupId);
        for (CommunicationGroupMember member : members) {
            InternalMessage msg = new InternalMessage();
            msg.setInstitutionId(1L);
            msg.setSenderId(0L);
            msg.setSubject(subject);
            msg.setBody(messageBody);
            msg.setPriority("NORMAL");
            InternalMessage saved = messageRepository.save(msg);
            MessageRecipient r = new MessageRecipient();
            r.setMessageId(saved.getId());
            r.setUserId(member.getUserId());
            recipientRepository.save(r);
            if (sendNotification) {
                Notification notif = new Notification();
                notif.setInstitutionId(1L);
                notif.setUserId(member.getUserId());
                notif.setTitle(subject);
                notif.setMessage(messageBody);
                notif.setChannel("INTERNAL");
                notificationRepository.save(notif);
                broadcaster.broadcastToUser(String.valueOf(member.getUserId()), Map.of(
                    "title", subject,
                    "messageBody", messageBody,
                    "type", "INTERNAL",
                    "severity", "INFO",
                    "createdAt", Instant.now().toString()
                ));
            }
        }
    }
}
