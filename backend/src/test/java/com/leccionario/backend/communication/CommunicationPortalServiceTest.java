package com.leccionario.backend.communication;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import java.time.Instant;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class CommunicationPortalServiceTest {

    private NotificationRepository notificationRepo;
    private CommunicationGroupRepository groupRepo;
    private MessageRecipientRepository messageRecipientRepo;
    private CircularRepository circularRepo;
    private SchoolEventRepository eventRepo;
    private CommunicationPortalService service;

    @BeforeEach
    void setUp() {
        notificationRepo = mock(NotificationRepository.class);
        groupRepo = mock(CommunicationGroupRepository.class);
        messageRecipientRepo = mock(MessageRecipientRepository.class);
        circularRepo = mock(CircularRepository.class);
        eventRepo = mock(SchoolEventRepository.class);
        service = new CommunicationPortalService(notificationRepo, groupRepo, messageRecipientRepo, circularRepo, eventRepo);
    }

    @Test
    void getPortalSummary_returnsMap() {
        when(notificationRepo.findByInstitutionIdOrderBySentAtDesc(1L)).thenReturn(List.of());
        when(groupRepo.findByInstitutionIdOrderByNameAsc(1L)).thenReturn(List.of());
        when(circularRepo.findByInstitutionIdOrderByPublishDateDesc(1L)).thenReturn(List.of());
        when(eventRepo.findByInstitutionIdOrderByEventDateDesc(1L)).thenReturn(List.of());

        Map<String, Object> result = service.getPortalSummary(1L);
        assertNotNull(result);
    }
}
