package com.leccionario.backend.communication;

import com.leccionario.backend.config.NotificationBroadcaster;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class CommunicationServiceTest {

    private NotificationRepository notificationRepository;
    private InternalMessageRepository messageRepository;
    private MessageRecipientRepository recipientRepository;
    private ParentCommunicationRepository parentCommRepository;
    private CommunicationGroupRepository groupRepository;
    private CommunicationGroupMemberRepository groupMemberRepository;
    private NotificationBroadcaster broadcaster;
    private CommunicationService service;

    @BeforeEach
    void setUp() {
        notificationRepository = mock(NotificationRepository.class);
        messageRepository = mock(InternalMessageRepository.class);
        recipientRepository = mock(MessageRecipientRepository.class);
        parentCommRepository = mock(ParentCommunicationRepository.class);
        groupRepository = mock(CommunicationGroupRepository.class);
        groupMemberRepository = mock(CommunicationGroupMemberRepository.class);
        broadcaster = mock(NotificationBroadcaster.class);
        service = new CommunicationService(notificationRepository, messageRepository,
            recipientRepository, parentCommRepository, groupRepository, groupMemberRepository, broadcaster);
    }

    @Test
    void getUserNotifications_delegatesToRepository() {
        when(notificationRepository.findByUserIdOrderBySentAtDesc(1L)).thenReturn(List.of());
        List<Notification> result = service.getUserNotifications(1L);
        assertNotNull(result);
        verify(notificationRepository).findByUserIdOrderBySentAtDesc(1L);
    }

    @Test
    void getUnreadCount_returnsCount() {
        when(notificationRepository.countByUserIdAndReadStatus(1L, false)).thenReturn(5L);
        long count = service.getUnreadCount(1L);
        assertEquals(5L, count);
    }

    @Test
    void markAsRead_setsReadStatus() {
        Notification n = new Notification();
        n.setReadStatus(false);
        when(notificationRepository.findById(1L)).thenReturn(Optional.of(n));
        when(notificationRepository.save(any())).thenReturn(n);
        Notification result = service.markAsRead(1L);
        assertTrue(result.getReadStatus());
        assertNotNull(result.getReadAt());
    }

    @Test
    void createNotification_savesAndBroadcasts() {
        Notification n = new Notification();
        n.setUserId(10L);
        n.setTitle("Test");
        n.setMessage("Body");
        n.setChannel("INTERNAL");
        n.setPriority("INFO");
        when(notificationRepository.save(any())).thenReturn(n);
        Notification result = service.createNotification(n);
        assertNotNull(result);
        verify(broadcaster).broadcastToUser(eq("10"), any());
    }

    @Test
    void findAllGroups_delegatesToRepository() {
        when(groupRepository.findByInstitutionIdOrderByNameAsc(1L)).thenReturn(List.of());
        List<CommunicationGroup> result = service.findAllGroups(1L);
        assertNotNull(result);
    }

    @Test
    void createGroup_savesGroup() {
        CommunicationGroup group = new CommunicationGroup();
        group.setName("Docentes");
        group.setInstitutionId(1L);
        when(groupRepository.save(any())).thenReturn(group);
        CommunicationGroup saved = service.createGroup(group);
        assertEquals("Docentes", saved.getName());
    }

    @Test
    void updateGroup_modifiesFields() {
        CommunicationGroup existing = new CommunicationGroup();
        existing.setId(1L);
        existing.setName("Old");
        existing.setDescription("Old desc");
        CommunicationGroup updated = new CommunicationGroup();
        updated.setName("New");
        updated.setDescription("New desc");
        when(groupRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(groupRepository.save(any())).thenReturn(existing);
        CommunicationGroup result = service.updateGroup(1L, updated);
        assertEquals("New", result.getName());
    }

    @Test
    void deleteGroup_removesMembersAndGroup() {
        CommunicationGroupMember m = new CommunicationGroupMember();
        when(groupMemberRepository.findByGroupId(1L)).thenReturn(List.of(m));
        service.deleteGroup(1L);
        verify(groupMemberRepository).delete(m);
        verify(groupRepository).deleteById(1L);
    }
}
