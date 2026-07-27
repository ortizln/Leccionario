package com.leccionario.backend.communication;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class MessageServiceTest {

    private InternalMessageRepository messageRepo;
    private MessageRecipientRepository recipientRepo;
    private MessageService service;

    @BeforeEach
    void setUp() {
        messageRepo = mock(InternalMessageRepository.class);
        recipientRepo = mock(MessageRecipientRepository.class);
        service = new MessageService(messageRepo, recipientRepo);
    }

    @Test
    void sendMessage_createsMessageAndRecipients() {
        when(messageRepo.save(any())).thenAnswer(inv -> {
            InternalMessage msg = inv.getArgument(0);
            java.lang.reflect.Field f = InternalMessage.class.getDeclaredField("id");
            f.setAccessible(true);
            f.set(msg, 1L);
            return msg;
        });

        Map<String, Object> result = service.sendMessage(1L, 10L, "Subject", "Body", "ALTA", List.of(20L, 30L));
        assertEquals(1L, result.get("id"));
        assertEquals(2, result.get("recipientCount"));
        verify(recipientRepo, times(2)).save(any());
    }

    @Test
    void sendMessage_defaultsToNormalPriority() {
        when(messageRepo.save(any())).thenAnswer(inv -> {
            InternalMessage msg = inv.getArgument(0);
            java.lang.reflect.Field f = InternalMessage.class.getDeclaredField("id");
            f.setAccessible(true);
            f.set(msg, 2L);
            return msg;
        });

        service.sendMessage(1L, 10L, "Subject", "Body", null, List.of(20L));
        verify(messageRepo).save(argThat(m -> "NORMAL".equals(m.getPriority())));
    }

    @Test
    void getUnreadCount_delegatesToRecipientRepo() {
        when(recipientRepo.countByUserIdAndReadStatus(1L, false)).thenReturn(5L);
        assertEquals(5L, service.getUnreadCount(1L));
    }

    @Test
    void getInbox_assemblesInboxItems() {
        MessageRecipient r = new MessageRecipient();
        r.setMessageId(1L);
        r.setUserId(1L);
        r.setReadStatus(false);
        when(recipientRepo.findByUserIdOrderByCreatedAtDesc(1L)).thenReturn(List.of(r));

        InternalMessage msg = new InternalMessage();
        try {
            java.lang.reflect.Field f = InternalMessage.class.getDeclaredField("id");
            f.setAccessible(true);
            f.set(msg, 1L);
        } catch (Exception ignored) {}
        msg.setSubject("Hi");
        msg.setBody("Body");
        msg.setSenderId(10L);
        msg.setPriority("NORMAL");
        when(messageRepo.findById(1L)).thenReturn(Optional.of(msg));

        List<Map<String, Object>> inbox = service.getInbox(1L);
        assertEquals(1, inbox.size());
        assertEquals("Hi", inbox.get(0).get("subject"));
        assertEquals(false, inbox.get(0).get("read"));
    }

    @Test
    void getSent_assemblesSentItems() {
        InternalMessage msg = new InternalMessage();
        try {
            java.lang.reflect.Field f = InternalMessage.class.getDeclaredField("id");
            f.setAccessible(true);
            f.set(msg, 1L);
        } catch (Exception ignored) {}
        msg.setSubject("Sent");
        msg.setBody("Body");
        msg.setSenderId(10L);
        msg.setPriority("NORMAL");
        when(messageRepo.findBySenderIdOrderByCreatedAtDesc(10L)).thenReturn(List.of(msg));

        MessageRecipient r = new MessageRecipient();
        r.setReadStatus(true);
        when(recipientRepo.findByMessageId(1L)).thenReturn(List.of(r));

        List<Map<String, Object>> sent = service.getSent(10L);
        assertEquals(1, sent.size());
        assertEquals(1, sent.get(0).get("recipientCount"));
        assertEquals(1L, sent.get(0).get("readCount"));
    }

    @Test
    void getMessageStats_returnsMap() {
        when(recipientRepo.findByUserIdOrderByCreatedAtDesc(1L)).thenReturn(List.of());
        when(recipientRepo.countByUserIdAndReadStatus(1L, false)).thenReturn(0L);
        when(messageRepo.findBySenderIdOrderByCreatedAtDesc(1L)).thenReturn(List.of());

        Map<String, Object> stats = service.getMessageStats(1L);
        assertEquals(0, stats.get("totalReceived"));
        assertEquals(0L, stats.get("unread"));
        assertEquals(0, stats.get("totalSent"));
    }
}
