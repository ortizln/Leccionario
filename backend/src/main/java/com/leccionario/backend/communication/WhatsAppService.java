package com.leccionario.backend.communication;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class WhatsAppService {

    private static final Logger log = LoggerFactory.getLogger(WhatsAppService.class);

    public void sendWhatsApp(String to, String message) {
        log.info("WHATSAPP SENT -> To: {} | Message: {}", to, message);
    }

    public void sendBulkWhatsApp(java.util.List<String> recipients, String message) {
        log.info("WHATSAPP BULK -> Recipients: {} | Message: {}", recipients.size(), message);
    }
}
