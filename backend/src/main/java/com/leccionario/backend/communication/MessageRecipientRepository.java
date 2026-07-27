package com.leccionario.backend.communication;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MessageRecipientRepository extends JpaRepository<MessageRecipient, Long> {
    List<MessageRecipient> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<MessageRecipient> findByMessageId(Long messageId);
    long countByUserIdAndReadStatus(Long userId, Boolean readStatus);
}
