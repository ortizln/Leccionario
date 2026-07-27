package com.leccionario.backend.communication;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserIdOrderBySentAtDesc(Long userId);
    List<Notification> findByUserIdAndReadStatusOrderBySentAtDesc(Long userId, Boolean readStatus);
    List<Notification> findByInstitutionIdOrderBySentAtDesc(Long institutionId);
    long countByUserIdAndReadStatus(Long userId, Boolean readStatus);
}
