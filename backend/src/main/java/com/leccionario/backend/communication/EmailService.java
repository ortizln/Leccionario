package com.leccionario.backend.communication;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    public void sendEmail(String to, String subject, String body) {
        // In production, integrate with SMTP (JavaMailSender)
        // For now, log the email for development purposes
        log.info("EMAIL SENT -> To: {} | Subject: {} | Body: {}", to, subject, body);
    }

    public void sendNotification(Long userId, String title, String message) {
        // Store notification and optionally send email
        log.info("NOTIFICATION -> User: {} | Title: {} | Message: {}", userId, title, message);
    }
}
