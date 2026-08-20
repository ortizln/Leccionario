package com.leccionario.backend.communication;

import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.javamail.JavaMailSender;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmailServiceTest {

    @Mock
    private JavaMailSender javaMailSender;

    @InjectMocks
    private EmailService service;

    @Test
    void sendEmail_doesNotThrow() {
        when(javaMailSender.createMimeMessage()).thenReturn(mock(MimeMessage.class));

        assertDoesNotThrow(() -> service.sendEmail("test@test.com", "Subject", "Body"));
        verify(javaMailSender).send(any(MimeMessage.class));
    }

    @Test
    void sendNotification_doesNotThrow() {
        assertDoesNotThrow(() -> service.sendNotification(1L, "Title", "Message"));
    }
}
