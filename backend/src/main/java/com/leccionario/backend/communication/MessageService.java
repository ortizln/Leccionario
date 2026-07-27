package com.leccionario.backend.communication;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.Instant;
import java.util.*;

@Service
public class MessageService {

    private final InternalMessageRepository messageRepo;
    private final MessageRecipientRepository recipientRepo;

    public MessageService(InternalMessageRepository messageRepo, MessageRecipientRepository recipientRepo) {
        this.messageRepo = messageRepo;
        this.recipientRepo = recipientRepo;
    }

    public List<Map<String, Object>> getInbox(Long userId) {
        List<MessageRecipient> recipients = recipientRepo.findByUserIdOrderByCreatedAtDesc(userId);
        List<Map<String, Object>> inbox = new ArrayList<>();
        for (MessageRecipient r : recipients) {
            Optional<InternalMessage> msgOpt = messageRepo.findById(r.getMessageId());
            if (msgOpt.isPresent()) {
                InternalMessage msg = msgOpt.get();
                Map<String, Object> item = new LinkedHashMap<>();
                item.put("id", msg.getId());
                item.put("subject", msg.getSubject());
                item.put("body", msg.getBody());
                item.put("senderId", msg.getSenderId());
                item.put("priority", msg.getPriority());
                item.put("read", r.getReadStatus());
                item.put("readAt", r.getReadAt());
                item.put("createdAt", msg.getCreatedAt());
                inbox.add(item);
            }
        }
        return inbox;
    }

    public List<Map<String, Object>> getSent(Long userId) {
        List<InternalMessage> messages = messageRepo.findBySenderIdOrderByCreatedAtDesc(userId);
        List<Map<String, Object>> sent = new ArrayList<>();
        for (InternalMessage msg : messages) {
            List<MessageRecipient> recipients = recipientRepo.findByMessageId(msg.getId());
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("id", msg.getId());
            item.put("subject", msg.getSubject());
            item.put("body", msg.getBody());
            item.put("priority", msg.getPriority());
            item.put("recipientCount", recipients.size());
            item.put("readCount", recipients.stream().filter(MessageRecipient::getReadStatus).count());
            item.put("createdAt", msg.getCreatedAt());
            sent.add(item);
        }
        return sent;
    }

    public long getUnreadCount(Long userId) {
        return recipientRepo.countByUserIdAndReadStatus(userId, false);
    }

    @Transactional
    public Map<String, Object> sendMessage(Long institutionId, Long senderId, String subject, String body, String priority, List<Long> recipientIds) {
        InternalMessage msg = new InternalMessage();
        msg.setInstitutionId(institutionId);
        msg.setSenderId(senderId);
        msg.setSubject(subject);
        msg.setBody(body);
        msg.setPriority(priority != null ? priority : "NORMAL");
        msg = messageRepo.save(msg);

        for (Long rid : recipientIds) {
            MessageRecipient r = new MessageRecipient();
            r.setMessageId(msg.getId());
            r.setUserId(rid);
            recipientRepo.save(r);
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("id", msg.getId());
        result.put("recipientCount", recipientIds.size());
        return result;
    }

    @Transactional
    public void markAsRead(Long messageId, Long userId) {
        List<MessageRecipient> recipients = recipientRepo.findByMessageId(messageId);
        recipients.stream()
            .filter(r -> r.getUserId().equals(userId))
            .findFirst()
            .ifPresent(r -> {
                r.setReadStatus(true);
                r.setReadAt(Instant.now());
                recipientRepo.save(r);
            });
    }

    @Transactional
    public void markAllAsRead(Long userId) {
        List<MessageRecipient> recipients = recipientRepo.findByUserIdOrderByCreatedAtDesc(userId);
        for (MessageRecipient r : recipients) {
            if (!Boolean.TRUE.equals(r.getReadStatus())) {
                r.setReadStatus(true);
                r.setReadAt(Instant.now());
                recipientRepo.save(r);
            }
        }
    }

    public Map<String, Object> getMessageStats(Long userId) {
        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalReceived", recipientRepo.findByUserIdOrderByCreatedAtDesc(userId).size());
        stats.put("unread", getUnreadCount(userId));
        stats.put("totalSent", messageRepo.findBySenderIdOrderByCreatedAtDesc(userId).size());
        return stats;
    }
}
