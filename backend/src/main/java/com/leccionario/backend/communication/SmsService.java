package com.leccionario.backend.communication;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class SmsService {

    private static final Logger log = LoggerFactory.getLogger(SmsService.class);

    public void sendSms(String to, String message) {
        log.info("SMS SENT -> To: {} | Message: {}", to, message);
    }

    public void sendBulkSms(java.util.List<String> recipients, String message) {
        log.info("SMS BULK -> Recipients: {} | Message: {}", recipients.size(), message);
    }
}
