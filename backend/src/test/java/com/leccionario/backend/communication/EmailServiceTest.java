package com.leccionario.backend.communication;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class EmailServiceTest {

    private EmailService service;

    @BeforeEach
    void setUp() {
        service = new EmailService();
    }

    @Test
    void sendEmail_doesNotThrow() {
        assertDoesNotThrow(() -> service.sendEmail("test@test.com", "Subject", "Body"));
    }

    @Test
    void sendNotification_doesNotThrow() {
        assertDoesNotThrow(() -> service.sendNotification(1L, "Title", "Message"));
    }
}
